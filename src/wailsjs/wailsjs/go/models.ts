export namespace models {
	
	export class AdminCreationRequest {
	    id: string;
	    newAdminUsername: string;
	    newAdminName: string;
	    verificationType: string;
	    isVerified: boolean;
	    // Go type: time
	    verifiedAt?: any;
	    status: string;
	    rejectionReason?: string;
	    requestedById: string;
	    approvedById?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    // Go type: time
	    expiresAt: any;
	
	    static createFrom(source: any = {}) {
	        return new AdminCreationRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.newAdminUsername = source["newAdminUsername"];
	        this.newAdminName = source["newAdminName"];
	        this.verificationType = source["verificationType"];
	        this.isVerified = source["isVerified"];
	        this.verifiedAt = this.convertValues(source["verifiedAt"], null);
	        this.status = source["status"];
	        this.rejectionReason = source["rejectionReason"];
	        this.requestedById = source["requestedById"];
	        this.approvedById = source["approvedById"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.expiresAt = this.convertValues(source["expiresAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AdminRecoveryToken {
	    id: string;
	    userId: string;
	    // Go type: time
	    expiresAt: any;
	    attempts: number;
	    // Go type: time
	    consumedAt?: any;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new AdminRecoveryToken(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.userId = source["userId"];
	        this.expiresAt = this.convertValues(source["expiresAt"], null);
	        this.attempts = source["attempts"];
	        this.consumedAt = this.convertValues(source["consumedAt"], null);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AdminTOTPConfig {
	    id: string;
	    userId: string;
	    issuer: string;
	    label: string;
	    enabled: boolean;
	    // Go type: time
	    verifiedAt?: any;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new AdminTOTPConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.userId = source["userId"];
	        this.issuer = source["issuer"];
	        this.label = source["label"];
	        this.enabled = source["enabled"];
	        this.verifiedAt = this.convertValues(source["verifiedAt"], null);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class AuditLog {
	    id: string;
	    actorUserId?: string;
	    action: string;
	    targetType: string;
	    targetId?: string;
	    status: string;
	    message?: string;
	    ipAddress?: string;
	    metadata?: string;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new AuditLog(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.actorUserId = source["actorUserId"];
	        this.action = source["action"];
	        this.targetType = source["targetType"];
	        this.targetId = source["targetId"];
	        this.status = source["status"];
	        this.message = source["message"];
	        this.ipAddress = source["ipAddress"];
	        this.metadata = source["metadata"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NetworkAuthority {
	    id: string;
	    networkHash: string;
	    primaryAdminUserId?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new NetworkAuthority(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.networkHash = source["networkHash"];
	        this.primaryAdminUserId = source["primaryAdminUserId"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class Transaction {
	    id: string;
	    transactionRef: string;
	    customerName?: string;
	    customerPhone?: string;
	    jobTitle: string;
	    totalAmount: number;
	    status: string;
	    memberId: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new Transaction(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.transactionRef = source["transactionRef"];
	        this.customerName = source["customerName"];
	        this.customerPhone = source["customerPhone"];
	        this.jobTitle = source["jobTitle"];
	        this.totalAmount = source["totalAmount"];
	        this.status = source["status"];
	        this.memberId = source["memberId"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class User {
	    id: string;
	    username: string;
	    email?: string;
	    name: string;
	    role: string;
	    sessionToken?: string;
	    isOnline: boolean;
	    // Go type: time
	    lastSeen?: any;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    transactions: Transaction[];
	    createdRequests: AdminCreationRequest[];
	    approvedRequests: AdminCreationRequest[];
	    networkAuthority?: NetworkAuthority;
	    recoveryTokens: AdminRecoveryToken[];
	    totpConfig?: AdminTOTPConfig;
	    auditEvents: AuditLog[];
	
	    static createFrom(source: any = {}) {
	        return new User(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.email = source["email"];
	        this.name = source["name"];
	        this.role = source["role"];
	        this.sessionToken = source["sessionToken"];
	        this.isOnline = source["isOnline"];
	        this.lastSeen = this.convertValues(source["lastSeen"], null);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.transactions = this.convertValues(source["transactions"], Transaction);
	        this.createdRequests = this.convertValues(source["createdRequests"], AdminCreationRequest);
	        this.approvedRequests = this.convertValues(source["approvedRequests"], AdminCreationRequest);
	        this.networkAuthority = this.convertValues(source["networkAuthority"], NetworkAuthority);
	        this.recoveryTokens = this.convertValues(source["recoveryTokens"], AdminRecoveryToken);
	        this.totpConfig = this.convertValues(source["totpConfig"], AdminTOTPConfig);
	        this.auditEvents = this.convertValues(source["auditEvents"], AuditLog);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace services {
	
	export class AuthResponse {
	    success: boolean;
	    error?: string;
	    user?: models.User;
	
	    static createFrom(source: any = {}) {
	        return new AuthResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	        this.user = this.convertValues(source["user"], models.User);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

