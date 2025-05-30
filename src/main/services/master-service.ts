// src/main/services/master-service.ts
import { MasterRepository } from '../database/repositories/master-repository';
import { VehicleType, Customer, BusinessCategory, ApiResponse } from '../../shared/types';
import { ValidationUtils } from '../../shared/utils';

export class MasterService {
    private masterRepository: MasterRepository;

    constructor(masterRepository: MasterRepository) {
        this.masterRepository = masterRepository;
    }

    // ===== 車種マスタ =====

    /**
     * 車種一覧を取得（使用頻度順）
     */
    async getVehicleTypes(): Promise<ApiResponse<VehicleType[]>> {
        return await this.masterRepository.getVehicleTypes();
    }

    /**
     * 車種を作成（バリデーション付き）
     */
    async createVehicleType(name: string): Promise<ApiResponse<VehicleType>> {
        try {
            // バリデーション
            const validation = this.validateVehicleTypeName(name);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }

            return await this.masterRepository.createVehicleType(name.trim());
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種の作成に失敗しました'
            };
        }
    }

    /**
     * 車種の使用回数を増加（予定作成時に呼び出し）
     */
    async incrementVehicleTypeUsage(name: string): Promise<ApiResponse<void>> {
        if (!name) return { success: true };
        return await this.masterRepository.incrementVehicleTypeUsage(name);
    }

    /**
     * 車種を削除
     */
    async deleteVehicleType(id: number): Promise<ApiResponse<void>> {
        return await this.masterRepository.deleteVehicleType(id);
    }

    // ===== 顧客マスタ =====

    /**
     * 顧客一覧を取得（使用頻度順）
     */
    async getCustomers(): Promise<ApiResponse<Customer[]>> {
        return await this.masterRepository.getCustomers();
    }

    /**
     * 顧客を作成（バリデーション付き）
     */
    async createCustomer(name: string, contactInfo?: string): Promise<ApiResponse<Customer>> {
        try {
            // バリデーション
            const validation = this.validateCustomerData(name, contactInfo);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }

            return await this.masterRepository.createCustomer(name.trim(), contactInfo?.trim());
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の作成に失敗しました'
            };
        }
    }

    /**
     * 顧客情報を更新
     */
    async updateCustomer(id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
        try {
            // バリデーション
            if (data.name !== undefined) {
                const nameValidation = this.validateCustomerName(data.name);
                if (!nameValidation.isValid) {
                    return {
                        success: false,
                        error: nameValidation.errors.join(', ')
                    };
                }
            }

            return await this.masterRepository.updateCustomer(id, data);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客情報の更新に失敗しました'
            };
        }
    }

    /**
     * 顧客の使用回数を増加（予定作成時に呼び出し）
     */
    async incrementCustomerUsage(name: string): Promise<ApiResponse<void>> {
        if (!name) return { success: true };
        return await this.masterRepository.incrementCustomerUsage(name);
    }

    /**
     * 顧客を削除
     */
    async deleteCustomer(id: number): Promise<ApiResponse<void>> {
        return await this.masterRepository.deleteCustomer(id);
    }

    // ===== 業務カテゴリマスタ =====

    /**
     * 業務カテゴリ一覧を取得（使用頻度順）
     */
    async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
        return await this.masterRepository.getBusinessCategories();
    }

    /**
     * 業務カテゴリを作成（バリデーション付き）
     */
    async createBusinessCategory(
        name: string,
        icon?: string,
        estimatedDuration?: number
    ): Promise<ApiResponse<BusinessCategory>> {
        try {
            // バリデーション
            const validation = this.validateBusinessCategoryData(name, icon, estimatedDuration);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }

            return await this.masterRepository.createBusinessCategory(
                name.trim(),
                icon?.trim(),
                estimatedDuration
            );
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの作成に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリ情報を更新
     */
    async updateBusinessCategory(id: number, data: Partial<BusinessCategory>): Promise<ApiResponse<BusinessCategory>> {
        try {
            // バリデーション
            if (data.name !== undefined) {
                const nameValidation = this.validateBusinessCategoryName(data.name);
                if (!nameValidation.isValid) {
                    return {
                        success: false,
                        error: nameValidation.errors.join(', ')
                    };
                }
            }

            if (data.estimatedDuration !== undefined && data.estimatedDuration !== null) {
                if (data.estimatedDuration < 0 || data.estimatedDuration > 480) { // 8時間まで
                    return {
                        success: false,
                        error: '推定作業時間は0分から480分の間で設定してください'
                    };
                }
            }

            return await this.masterRepository.updateBusinessCategory(id, data);
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ情報の更新に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリの使用回数を増加（予定作成時に呼び出し）
     */
    async incrementBusinessCategoryUsage(name: string): Promise<ApiResponse<void>> {
        if (!name) return { success: true };
        return await this.masterRepository.incrementBusinessCategoryUsage(name);
    }

    /**
     * 業務カテゴリを削除
     */
    async deleteBusinessCategory(id: number): Promise<ApiResponse<void>> {
        return await this.masterRepository.deleteBusinessCategory(id);
    }

    // ===== 統合機能 =====

    /**
     * 予定作成時のマスタデータ使用回数更新
     */
    async updateUsageCountsFromSchedule(
        vehicleType?: string,
        customerName?: string,
        businessCategory?: string
    ): Promise<void> {
        try {
            // 並行して更新（エラーが発生しても他の更新は継続）
            const updatePromises = [];

            if (vehicleType) {
                updatePromises.push(this.incrementVehicleTypeUsage(vehicleType));
            }

            if (customerName) {
                updatePromises.push(this.incrementCustomerUsage(customerName));
            }

            if (businessCategory) {
                updatePromises.push(this.incrementBusinessCategoryUsage(businessCategory));
            }

            await Promise.allSettled(updatePromises);
        } catch (error) {
            console.error('マスタデータ使用回数の更新でエラーが発生しました:', error);
            // エラーが発生しても予定作成は継続させる
        }
    }

    /**
     * 全マスタデータを取得（ダッシュボード用）
     */
    async getAllMasterData(): Promise<ApiResponse<{
        vehicleTypes: VehicleType[];
        customers: Customer[];
        businessCategories: BusinessCategory[];
    }>> {
        try {
            const [vehicleTypesResponse, customersResponse, businessCategoriesResponse] = await Promise.all([
                this.getVehicleTypes(),
                this.getCustomers(),
                this.getBusinessCategories()
            ]);

            return {
                success: true,
                data: {
                    vehicleTypes: vehicleTypesResponse.success ? vehicleTypesResponse.data! : [],
                    customers: customersResponse.success ? customersResponse.data! : [],
                    businessCategories: businessCategoriesResponse.success ? businessCategoriesResponse.data! : []
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'マスタデータの取得に失敗しました'
            };
        }
    }

    // ===== バリデーション =====

    private validateVehicleTypeName(name: string) {
        const validations = [
            ValidationUtils.validateRequired(name),
        ];

        if (name && name.trim().length > 50) {
            validations.push({
                isValid: false,
                errors: ['車種名は50文字以内で入力してください']
            });
        }

        return ValidationUtils.combineValidationResults(validations);
    }

    private validateCustomerName(name: string) {
        const validations = [
            ValidationUtils.validateRequired(name),
        ];

        if (name && name.trim().length > 100) {
            validations.push({
                isValid: false,
                errors: ['顧客名は100文字以内で入力してください']
            });
        }

        return ValidationUtils.combineValidationResults(validations);
    }

    private validateCustomerData(name: string, contactInfo?: string) {
        const validations = [
            this.validateCustomerName(name)
        ];

        if (contactInfo && contactInfo.trim().length > 200) {
            validations.push({
                isValid: false,
                errors: ['連絡先は200文字以内で入力してください']
            });
        }

        return ValidationUtils.combineValidationResults(validations);
    }

    private validateBusinessCategoryName(name: string) {
        const validations = [
            ValidationUtils.validateRequired(name),
        ];

        if (name && name.trim().length > 50) {
            validations.push({
                isValid: false,
                errors: ['業務カテゴリ名は50文字以内で入力してください']
            });
        }

        return ValidationUtils.combineValidationResults(validations);
    }

    private validateBusinessCategoryData(name: string, icon?: string, estimatedDuration?: number) {
        const validations = [
            this.validateBusinessCategoryName(name)
        ];

        if (icon && icon.trim().length > 10) {
            validations.push({
                isValid: false,
                errors: ['アイコンは10文字以内で入力してください']
            });
        }

        if (estimatedDuration !== undefined && estimatedDuration !== null) {
            if (estimatedDuration < 0 || estimatedDuration > 480) {
                validations.push({
                    isValid: false,
                    errors: ['推定作業時間は0分から480分の間で設定してください']
                });
            }
        }

        return ValidationUtils.combineValidationResults(validations);
    }
}