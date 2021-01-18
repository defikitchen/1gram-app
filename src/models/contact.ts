import { Network } from "./network";

export interface Contact {
  id: string;
  name: string;
  address: string;
  network: Network;
  lastUsed?: number;
}
