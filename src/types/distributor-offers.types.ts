export interface DistributorOfferObject {
  _id: string;
  userId: string;
  pricePerKilo: number;
  targetQuantity: number;
  collectedQuantity: number;
  totalInvestment: number;
  status: "DRAFT" | "PUBLISH" | "CLOSED";
  requirement: "HIGH" | "MEDIUM" | "LOW";
  createdAt: string;
  updatedAt: string;
  distributor: {
    user: DistributorUserObject;
    distributorDetails: distributorDetailsObject;
  };
}

export interface DistributorUserObject {
  id: string;
  email: string;
  role: "DISTRIBUTOR";
  isOnboarded: true;
  plan: string;
  isSubscribed: false;
  isVerified: false;
}

export interface distributorDetailsObject {
  id: string;
  userId: string;
  docUrls: string[];
  companyName: string;
  registrationNumber: string;
  address: string;
}

export interface CreateDistributorOfferRequest {
  pricePerKilo: number;
  targetQuantity: number;
  totalInvestment: number;
  requirement: "HIGH" | "MEDIUM" | "LOW";
}

export interface CreateDistributorOfferResponse {
  success: boolean;
  message: string;
  data: DistributorOfferObject;
}

export interface GetMyDistributorOffersRequest {
  limit?: number;
  page?: number;
  requirement?: "HIGH" | "MEDIUM" | "LOW";
  status?: "DRAFT" | "PUBLISH" | "CLOSED";
}

export interface GetMyDistributorOffersResponse {
  success: true;
  message: string;
  data: DistributorOfferObject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetDistributorOffersRequest {
  limit?: number;
  page?: number;
  requirement?: "HIGH" | "MEDIUM" | "LOW";
  status?: "DRAFT" | "PUBLISH" | "CLOSED";
}

export interface GetDistributorOffersResponse {
  success: true;
  message: string;
  data: DistributorOfferObject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface GetMyDistributorOffersRequest {
  limit?: number;
  page?: number;
  requirement?: "HIGH" | "MEDIUM" | "LOW";
  status?: "DRAFT" | "PUBLISH" | "CLOSED";
}

export interface GetMyDistributorOffersResponse {
  success: true;
  message: string;
  data: DistributorOfferObject[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
