from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import Client
from app.core.supabase import get_supabase

security = HTTPBearer()


class CurrentUser:
    def __init__(self, id: UUID, email: str, org_id: UUID, role: str = "member") -> None:
        self.id = id
        self.email = email
        self.org_id = org_id
        self.role = role


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_supabase),
) -> CurrentUser:
    token = credentials.credentials

    # Supabase JWT verifizieren
    try:
        response = db.auth.get_user(token)
        auth_user = response.user if response else None
    except Exception:
        auth_user = None

    if not auth_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Ungültiger oder abgelaufener Token",
        )

    user_id = UUID(auth_user.id)

    # User-Eintrag in unserer users-Tabelle suchen (limit statt maybe_single — robuster)
    res = (
        db.table("users")
        .select("org_id, role")
        .eq("id", str(user_id))
        .limit(1)
        .execute()
    )
    user_data = res.data[0] if (res and res.data) else None

    if not user_data:
        # Erster Login: Organisation + User-Eintrag anlegen
        org_res = (
            db.table("organizations")
            .insert({"name": f"Org von {auth_user.email}"})
            .execute()
        )
        if not org_res or not org_res.data:
            raise HTTPException(status_code=500, detail="Organisation konnte nicht angelegt werden")

        org_id = UUID(org_res.data[0]["id"])

        db.table("users").insert(
            {
                "id": str(user_id),
                "org_id": str(org_id),
                "email": auth_user.email or "",
                "role": "org_admin",
            }
        ).execute()
        role = "org_admin"
    else:
        org_id = UUID(user_data["org_id"])
        role = user_data.get("role", "member")

    return CurrentUser(id=user_id, email=auth_user.email or "", org_id=org_id, role=role)


AuthDep = Depends(get_current_user)
