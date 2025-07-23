import type { PrismaClient, User } from "@prisma/client";
import type { UpdateUserProfileInput } from "../schemas/user";
import { BaseRepository } from "./base";

export class UserRepository extends BaseRepository {
	async findByAuth0Id(auth0Id: string): Promise<User | null> {
		try {
			return await this.prisma.user.findUnique({
				where: { auth0Id },
			});
		} catch (error) {
			this.handleError(error, "findByAuth0Id");
		}
	}

	async findById(id: string): Promise<User | null> {
		try {
			return await this.prisma.user.findUnique({
				where: { id },
			});
		} catch (error) {
			this.handleError(error, "findById");
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		try {
			return await this.prisma.user.findUnique({
				where: { email },
			});
		} catch (error) {
			this.handleError(error, "findByEmail");
		}
	}

	async create(userData: {
		email: string;
		auth0Id: string;
		name?: string;
		avatarUrl?: string;
	}): Promise<User> {
		try {
			return await this.prisma.user.create({
				data: userData,
			});
		} catch (error) {
			this.handleError(error, "create");
		}
	}

	async update(id: string, data: UpdateUserProfileInput): Promise<User> {
		try {
			return await this.prisma.user.update({
				where: { id },
				data: {
					...data,
					birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
				},
			});
		} catch (error) {
			this.handleError(error, "update");
		}
	}

	async delete(id: string): Promise<User> {
		try {
			return await this.prisma.user.delete({
				where: { id },
			});
		} catch (error) {
			this.handleError(error, "delete");
		}
	}

	async findOrCreate(userData: {
		email: string;
		auth0Id: string;
		name?: string;
		avatarUrl?: string;
	}): Promise<User> {
		try {
			// まず既存ユーザーを検索
			let user = await this.findByAuth0Id(userData.auth0Id);

			if (!user) {
				// 存在しない場合は新規作成
				user = await this.create(userData);
			} else {
				// 存在する場合は必要に応じて更新
				const updateData: UpdateUserProfileInput = {};
				let shouldUpdate = false;

				if (userData.email !== user.email) {
					// Email updates would need to be handled differently in the schema
					shouldUpdate = true;
				}
				if (userData.name && userData.name !== user.name) {
					updateData.name = userData.name;
					shouldUpdate = true;
				}
				if (userData.avatarUrl && userData.avatarUrl !== user.avatarUrl) {
					updateData.avatarUrl = userData.avatarUrl;
					shouldUpdate = true;
				}

				if (shouldUpdate) {
					user = await this.update(user.id, updateData);
				}
			}

			return user;
		} catch (error) {
			this.handleError(error, "findOrCreate");
		}
	}
}
