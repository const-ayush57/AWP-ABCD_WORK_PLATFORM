import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";

type NetworkIdentity = {
  networkHash: string;
  createdAt: string;
};

type DeviceIdentity = {
  deviceId: string;
  hostname: string;
  createdAt: string;
  lastSeenAt: string;
};

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function getPersistRoot() {
  if (process.env.AWP_PERSIST_ROOT) return process.env.AWP_PERSIST_ROOT;

  const programData = process.env.PROGRAMDATA;
  if (programData) return path.join(programData, "ABCD Work Platform");

  return path.join(os.homedir(), ".abcd-work-platform");
}

export function getPersistPaths() {
  const root = getPersistRoot();
  return {
    root,
    dataDir: path.join(root, "data"),
    authDir: path.join(root, "auth"),
    networkFile: path.join(root, "auth", "network-identity.json"),
    deviceFile: path.join(root, "auth", "device-identity.json"),
  };
}

export function computeNetworkHash() {
  const interfaces = os.networkInterfaces();
  const values: string[] = [];

  for (const entries of Object.values(interfaces)) {
    if (!entries) continue;

    for (const net of entries) {
      if (net.internal) continue;
      if (!net.mac || net.mac === "00:00:00:00:00:00") continue;

      values.push([net.mac, net.family, net.address].join("|"));
    }
  }

  values.sort();
  const raw = values.length > 0 ? values.join(";") : os.hostname();
  return sha256(raw);
}

export function ensureIdentityFiles() {
  const paths = getPersistPaths();
  ensureDir(paths.root);
  ensureDir(paths.dataDir);
  ensureDir(paths.authDir);

  if (!fs.existsSync(paths.networkFile)) {
    const network: NetworkIdentity = {
      networkHash: computeNetworkHash(),
      createdAt: new Date().toISOString(),
    };
    fs.writeFileSync(paths.networkFile, JSON.stringify(network, null, 2), "utf8");
  }

  const nowIso = new Date().toISOString();
  if (!fs.existsSync(paths.deviceFile)) {
    const device: DeviceIdentity = {
      deviceId: sha256([os.hostname(), os.platform(), os.arch(), os.userInfo().username].join("|")),
      hostname: os.hostname(),
      createdAt: nowIso,
      lastSeenAt: nowIso,
    };
    fs.writeFileSync(paths.deviceFile, JSON.stringify(device, null, 2), "utf8");
  } else {
    const existing = JSON.parse(fs.readFileSync(paths.deviceFile, "utf8")) as DeviceIdentity;
    const updated: DeviceIdentity = {
      ...existing,
      hostname: os.hostname(),
      lastSeenAt: nowIso,
    };
    fs.writeFileSync(paths.deviceFile, JSON.stringify(updated, null, 2), "utf8");
  }

  return paths;
}

export function readNetworkHash() {
  const paths = ensureIdentityFiles();
  const payload = JSON.parse(fs.readFileSync(paths.networkFile, "utf8")) as NetworkIdentity;
  return payload.networkHash;
}

export function readDeviceId() {
  const paths = ensureIdentityFiles();
  const payload = JSON.parse(fs.readFileSync(paths.deviceFile, "utf8")) as DeviceIdentity;
  return payload.deviceId;
}
