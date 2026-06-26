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
	export class JobOption {
	    id: string;
	    name: string;
	    additionalCost: number;
	    jobTemplateId: string;
	
	    static createFrom(source: any = {}) {
	        return new JobOption(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.additionalCost = source["additionalCost"];
	        this.jobTemplateId = source["jobTemplateId"];
	    }
	}
	export class JobTemplate {
	    id: string;
	    title: string;
	    basePrice: number;
	    category?: string;
	    options: JobOption[];
	    isActive: boolean;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new JobTemplate(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.basePrice = source["basePrice"];
	        this.category = source["category"];
	        this.options = this.convertValues(source["options"], JobOption);
	        this.isActive = source["isActive"];
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
	export class ServerConfig {
	    id: string;
	    serverHost: string;
	    serverPort: number;
	    adminUpiId?: string;
	    serverPublicKey?: string;
	    isEnabled: boolean;
	    lastConfiguredBy?: string;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	
	    static createFrom(source: any = {}) {
	        return new ServerConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.serverHost = source["serverHost"];
	        this.serverPort = source["serverPort"];
	        this.adminUpiId = source["adminUpiId"];
	        this.serverPublicKey = source["serverPublicKey"];
	        this.isEnabled = source["isEnabled"];
	        this.lastConfiguredBy = source["lastConfiguredBy"];
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
	
	export class AdminRequestUserSummary {
	    name: string;
	    username: string;
	
	    static createFrom(source: any = {}) {
	        return new AdminRequestUserSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.username = source["username"];
	    }
	}
	export class AdminRequestSummary {
	    id: string;
	    newAdminUsername: string;
	    newAdminName: string;
	    requestedBy: AdminRequestUserSummary;
	    approvedBy?: AdminRequestUserSummary;
	    // Go type: time
	    createdAt: any;
	    // Go type: time
	    updatedAt: any;
	    // Go type: time
	    expiresAt: any;
	    status: string;
	    // Go type: time
	    verifiedAt?: any;
	    rejectionReason?: string;
	
	    static createFrom(source: any = {}) {
	        return new AdminRequestSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.newAdminUsername = source["newAdminUsername"];
	        this.newAdminName = source["newAdminName"];
	        this.requestedBy = this.convertValues(source["requestedBy"], AdminRequestUserSummary);
	        this.approvedBy = this.convertValues(source["approvedBy"], AdminRequestUserSummary);
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.updatedAt = this.convertValues(source["updatedAt"], null);
	        this.expiresAt = this.convertValues(source["expiresAt"], null);
	        this.status = source["status"];
	        this.verifiedAt = this.convertValues(source["verifiedAt"], null);
	        this.rejectionReason = source["rejectionReason"];
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
	export class AdminUserSummary {
	    id: string;
	    name: string;
	    username: string;
	    isOnline: boolean;
	    // Go type: time
	    createdAt: any;
	
	    static createFrom(source: any = {}) {
	        return new AdminUserSummary(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.username = source["username"];
	        this.isOnline = source["isOnline"];
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
	export class AdminDashboardData {
	    admins: AdminUserSummary[];
	    authorityExists: boolean;
	    pendingRequests: AdminRequestSummary[];
	    completedRequests: AdminRequestSummary[];
	
	    static createFrom(source: any = {}) {
	        return new AdminDashboardData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.admins = this.convertValues(source["admins"], AdminUserSummary);
	        this.authorityExists = source["authorityExists"];
	        this.pendingRequests = this.convertValues(source["pendingRequests"], AdminRequestSummary);
	        this.completedRequests = this.convertValues(source["completedRequests"], AdminRequestSummary);
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
	
	
	
	export class AnalyticsFilters {
	    dateRange: string;
	    memberId: string;
	    paymentMethod: string;
	    category: string;
	
	    static createFrom(source: any = {}) {
	        return new AnalyticsFilters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.dateRange = source["dateRange"];
	        this.memberId = source["memberId"];
	        this.paymentMethod = source["paymentMethod"];
	        this.category = source["category"];
	    }
	}
	export class JobPopularityData {
	    job: string;
	    Count: number;
	    SharePercent: string;
	    Revenue: number;
	
	    static createFrom(source: any = {}) {
	        return new JobPopularityData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.job = source["job"];
	        this.Count = source["Count"];
	        this.SharePercent = source["SharePercent"];
	        this.Revenue = source["Revenue"];
	    }
	}
	export class MemberShareData {
	    name: string;
	    revenue: number;
	
	    static createFrom(source: any = {}) {
	        return new MemberShareData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.revenue = source["revenue"];
	    }
	}
	export class RevenueFlowData {
	    date: string;
	    Revenue: number;
	
	    static createFrom(source: any = {}) {
	        return new RevenueFlowData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.date = source["date"];
	        this.Revenue = source["Revenue"];
	    }
	}
	export class AnalyticsResponse {
	    revenueFlow: RevenueFlowData[];
	    memberShare: MemberShareData[];
	    jobPopularity: JobPopularityData[];
	    totalRevenue: number;
	    transactionCount: number;
	    transactions: models.Transaction[];
	    success: boolean;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new AnalyticsResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.revenueFlow = this.convertValues(source["revenueFlow"], RevenueFlowData);
	        this.memberShare = this.convertValues(source["memberShare"], MemberShareData);
	        this.jobPopularity = this.convertValues(source["jobPopularity"], JobPopularityData);
	        this.totalRevenue = source["totalRevenue"];
	        this.transactionCount = source["transactionCount"];
	        this.transactions = this.convertValues(source["transactions"], models.Transaction);
	        this.success = source["success"];
	        this.error = source["error"];
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
	export class AuditActor {
	    id: string;
	    username: string;
	    name: string;
	    role: string;
	
	    static createFrom(source: any = {}) {
	        return new AuditActor(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.username = source["username"];
	        this.name = source["name"];
	        this.role = source["role"];
	    }
	}
	export class AuditLogDetailed {
	    id: string;
	    action: string;
	    status: string;
	    message?: string;
	    // Go type: time
	    createdAt: any;
	    actor?: AuditActor;
	
	    static createFrom(source: any = {}) {
	        return new AuditLogDetailed(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.action = source["action"];
	        this.status = source["status"];
	        this.message = source["message"];
	        this.createdAt = this.convertValues(source["createdAt"], null);
	        this.actor = this.convertValues(source["actor"], AuditActor);
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
	export class BasicResponse {
	    success: boolean;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new BasicResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	    }
	}
	export class BootstrapStatusResponse {
	    bootstrapRequired: boolean;
	    adminExists: boolean;
	    hasAuthority: boolean;
	    networkHashMatched: boolean;
	    emailRecoveryConfigured: boolean;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new BootstrapStatusResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.bootstrapRequired = source["bootstrapRequired"];
	        this.adminExists = source["adminExists"];
	        this.hasAuthority = source["hasAuthority"];
	        this.networkHashMatched = source["networkHashMatched"];
	        this.emailRecoveryConfigured = source["emailRecoveryConfigured"];
	        this.error = source["error"];
	    }
	}
	export class CreateAdminRequestInput {
	    sessionToken: string;
	    newAdminUsername: string;
	    newAdminName: string;
	    newAdminPassword: string;
	    verificationType: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateAdminRequestInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.newAdminUsername = source["newAdminUsername"];
	        this.newAdminName = source["newAdminName"];
	        this.newAdminPassword = source["newAdminPassword"];
	        this.verificationType = source["verificationType"];
	    }
	}
	export class CreateAdminRequestResponse {
	    success: boolean;
	    requestId?: string;
	    verificationCode?: string;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateAdminRequestResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.requestId = source["requestId"];
	        this.verificationCode = source["verificationCode"];
	        this.error = source["error"];
	    }
	}
	export class CreateTransactionRequest {
	    jobTitle: string;
	    totalAmount: number;
	    customerName: string;
	    customerPhone: string;
	    memberId: string;
	
	    static createFrom(source: any = {}) {
	        return new CreateTransactionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.jobTitle = source["jobTitle"];
	        this.totalAmount = source["totalAmount"];
	        this.customerName = source["customerName"];
	        this.customerPhone = source["customerPhone"];
	        this.memberId = source["memberId"];
	    }
	}
	export class DeleteMemberRequest {
	    sessionToken: string;
	    adminPassword: string;
	    targetMemberId: string;
	
	    static createFrom(source: any = {}) {
	        return new DeleteMemberRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.adminPassword = source["adminPassword"];
	        this.targetMemberId = source["targetMemberId"];
	    }
	}
	export class GetAuditLogsRequest {
	    sessionToken: string;
	    limit: number;
	
	    static createFrom(source: any = {}) {
	        return new GetAuditLogsRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.limit = source["limit"];
	    }
	}
	export class JobOptionRequest {
	    id?: string;
	    name: string;
	    additionalCost: number;
	    jobTemplateId: string;
	
	    static createFrom(source: any = {}) {
	        return new JobOptionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.additionalCost = source["additionalCost"];
	        this.jobTemplateId = source["jobTemplateId"];
	    }
	}
	
	export class JobTemplateRequest {
	    id?: string;
	    title: string;
	    basePrice: number;
	    category?: string;
	    isActive: boolean;
	
	    static createFrom(source: any = {}) {
	        return new JobTemplateRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.title = source["title"];
	        this.basePrice = source["basePrice"];
	        this.category = source["category"];
	        this.isActive = source["isActive"];
	    }
	}
	export class MachineConfig {
	    mode: string;
	    serverIP: string;
	    port: number;
	    networkKey: string;
	
	    static createFrom(source: any = {}) {
	        return new MachineConfig(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.mode = source["mode"];
	        this.serverIP = source["serverIP"];
	        this.port = source["port"];
	        this.networkKey = source["networkKey"];
	    }
	}
	export class MemberRequest {
	    sessionToken: string;
	    id?: string;
	    name: string;
	    username: string;
	    password?: string;
	    role: string;
	
	    static createFrom(source: any = {}) {
	        return new MemberRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.id = source["id"];
	        this.name = source["name"];
	        this.username = source["username"];
	        this.password = source["password"];
	        this.role = source["role"];
	    }
	}
	
	export class MemberWithStats {
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
	    transactions: models.Transaction[];
	    createdRequests: models.AdminCreationRequest[];
	    approvedRequests: models.AdminCreationRequest[];
	    networkAuthority?: models.NetworkAuthority;
	    recoveryTokens: models.AdminRecoveryToken[];
	    totpConfig?: models.AdminTOTPConfig;
	    auditEvents: models.AuditLog[];
	    transactionCount: number;
	
	    static createFrom(source: any = {}) {
	        return new MemberWithStats(source);
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
	        this.transactions = this.convertValues(source["transactions"], models.Transaction);
	        this.createdRequests = this.convertValues(source["createdRequests"], models.AdminCreationRequest);
	        this.approvedRequests = this.convertValues(source["approvedRequests"], models.AdminCreationRequest);
	        this.networkAuthority = this.convertValues(source["networkAuthority"], models.NetworkAuthority);
	        this.recoveryTokens = this.convertValues(source["recoveryTokens"], models.AdminRecoveryToken);
	        this.totpConfig = this.convertValues(source["totpConfig"], models.AdminTOTPConfig);
	        this.auditEvents = this.convertValues(source["auditEvents"], models.AuditLog);
	        this.transactionCount = source["transactionCount"];
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
	export class PasswordResponse {
	    success: boolean;
	    error?: string;
	    data?: string;
	
	    static createFrom(source: any = {}) {
	        return new PasswordResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	        this.data = source["data"];
	    }
	}
	export class ResetMemberPasswordRequest {
	    sessionToken: string;
	    adminPassword: string;
	    targetMemberId: string;
	    newPassword: string;
	
	    static createFrom(source: any = {}) {
	        return new ResetMemberPasswordRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.adminPassword = source["adminPassword"];
	        this.targetMemberId = source["targetMemberId"];
	        this.newPassword = source["newPassword"];
	    }
	}
	
	export class SecureActionRequest {
	    sessionToken: string;
	    adminPassword: string;
	    actionType: string;
	    targetMemberId: string;
	    newPassword?: string;
	
	    static createFrom(source: any = {}) {
	        return new SecureActionRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.adminPassword = source["adminPassword"];
	        this.actionType = source["actionType"];
	        this.targetMemberId = source["targetMemberId"];
	        this.newPassword = source["newPassword"];
	    }
	}
	export class ServerConfigResponse {
	    success: boolean;
	    error?: string;
	    // Go type: struct { Host string "json:\"host\""; Port int "json:\"port\""; UPIID string "json:\"upiId\""; IsEnabled bool "json:\"isEnabled\"" }
	    config: any;
	
	    static createFrom(source: any = {}) {
	        return new ServerConfigResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	        this.config = this.convertValues(source["config"], Object);
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
	export class UpdateServerConfigRequest {
	    sessionToken: string;
	    serverHost: string;
	    serverPort: number;
	    adminUpiId: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateServerConfigRequest(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.serverHost = source["serverHost"];
	        this.serverPort = source["serverPort"];
	        this.adminUpiId = source["adminUpiId"];
	    }
	}
	export class VerifyAdminRequestInput {
	    sessionToken: string;
	    requestId: string;
	    verificationCode?: string;
	    action: string;
	    rejectionReason?: string;
	
	    static createFrom(source: any = {}) {
	        return new VerifyAdminRequestInput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionToken = source["sessionToken"];
	        this.requestId = source["requestId"];
	        this.verificationCode = source["verificationCode"];
	        this.action = source["action"];
	        this.rejectionReason = source["rejectionReason"];
	    }
	}

}

