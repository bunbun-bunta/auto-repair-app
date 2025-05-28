export interface MasterData {
    id?: number;
    name: string;
    displayOrder?: number;
    usageCount?: number;
    lastUsedAt?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}
export interface VehicleType extends MasterData {
}
export interface Customer extends MasterData {
    contactInfo?: string;
    lastServiceDate?: string;
}
export interface BusinessCategory extends MasterData {
    icon?: string;
    estimatedDuration?: number;
}
