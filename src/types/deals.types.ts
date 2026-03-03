export interface DealObject {
  _id: string;
  landownerId: string;
  distributorId: string;
  offerId: string;
  quantity: number;
  pricePerKilo: number;
  status: "DRAFT" | "ACCEPTED" | "CLOSED" | "CANCELED" | "PENDING";
  acceptedAt: string;
  createdAt: string;
  updatedAt: string;
  offer: {
    _id: string;
    userId: string;
    pricePerKilo: number;
    targetQuantity: number;
    collectedQuantity: number;
    totalInvestment: number;
    status: "PUBLISH" | "CLOSED";
    requirement: "HIGH" | "MEDIUM" | "LOW";
    createdAt: string;
    updatedAt: string;
    landowner: LandownerDealObject;
    distributor: DistributorObject;
  } | null;
  landowner?: LandownerDealObject;
  distributor?: DistributorObject;
}

export interface LandownerDealObject {
  user: {
    id: string;
    email: string;
    role: "LANDOWNER";
    isOnboarded: boolean;
    plan: string;
    isSubscribed: boolean;
    isVerified: boolean;
  };
  landOwnerDetails: {
    id: string;
    userId: string;
    docUrls: string[];
    totalBeds: number;
    nic: string;
    address: string;
  };
}

export interface DistributorObject {
  user: {
    id: string;
    email: string;
    role: "DISTRIBUTOR";
    isOnboarded: boolean;
    plan: string;
    isSubscribed: boolean;
    isVerified: boolean;
  };
  distributorDetails: {
    id: string;
    userId: string;
    docUrls: string[];
    companyName: string;
    registrationNumber: string;
    address: string;
  };
}

export interface CreateDealRequest {
  quantity: number;
}

export interface CreateDealResponse {
  success: boolean;
  message: string;
  data: any;
}

export interface GetLandownerDealsRequest {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "CLOSED" | "CANCELLED";
}

export interface GetLandownerDealsResponse {
  success: true;
  message: string;
  data: DealObject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetDistributorDealsRequest {
  page?: number;
  limit?: number;
  status?: "ACTIVE" | "CLOSED" | "CANCELLED";
}

export interface GetDistributorDealsResponse {
  success: true;
  message: string;
  data: DealObject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface UpdateDealsRequest {
  quantity?: number;
  pricePerKilo?: number;
  status?: "ACCEPTED" | "CLOSED" | "CANCELED";
}

export interface UpdateDealsResponse {
  success: boolean;
  message: string;
  data: DealObject;
}

export interface DeleteDealResponse {
  success: boolean;
  message: string;
}

