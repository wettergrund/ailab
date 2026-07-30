export interface CreateBidRequest {
  proposedHours: number;
  proposedPrice: number;
}

export interface BidResponse {
  id: number;
  taskId: number;
  workerId: number;
  proposedHours: number;
  proposedPrice: number;
  status: string;
  createdAt: string;
}
