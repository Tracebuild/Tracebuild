from fastapi import Depends, HTTPException, status
from app.core.auth import get_current_user, CurrentUser
from supabase import Client
from app.core.supabase import get_supabase

ROLE_HIERARCHY = {
    "super_admin": 4,
    "org_admin": 3,
    "project_manager": 2,
    "member": 1,
}


async def _get_user_role(user: CurrentUser, db: Client) -> str:
    res = (
        db.table("users")
        .select("role")
        .eq("id", str(user.id))
        .limit(1)
        .execute()
    )
    return res.data[0]["role"] if (res and res.data) else "member"


def require_role(*allowed_roles: str):
    """FastAPI dependency factory — raises 403 if user's role is not in allowed_roles."""
    async def dependency(
        user: CurrentUser = Depends(get_current_user),
        db: Client = Depends(get_supabase),
    ) -> CurrentUser:
        role = await _get_user_role(user, db)
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Zugriff verweigert. Benötigte Rolle: {', '.join(allowed_roles)}",
            )
        user.role = role  # type: ignore[attr-defined]
        return user

    return Depends(dependency)
