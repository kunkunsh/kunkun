/**
 * The simplest permission check function, will throw error if the user does not have the required permission instead of returning false.
 * Both parameters are expected to be string arrays. We use generic to make sure the type is correct.
 * @param userPermissions
 * @param requiredPermissions
 */
export function checkPermission<Permission extends string>(
	userPermissions: Permission[],
	requiredPermissions: Permission[]
) {
	if (!requiredPermissions.some((p) => userPermissions.includes(p))) {
		throw new Error(`${requiredPermissions.join(" or ")} permission is required`)
	}
}
