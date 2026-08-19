from uuid import UUID
from supabase import Client
from app.models.schemas import ProjectCreate, ProjectOut
from app.services.geoportal_service import lookup_parcel
from app.services.norm_assignment_service import assign_norms_to_project, assign_geoportal_norms_to_project


class ProjectService:
    def __init__(self, db: Client) -> None:
        self.db = db

    async def list_projects(self, org_id: UUID) -> list[ProjectOut]:
        res = (
            self.db.table("projects")
            .select("*")
            .eq("org_id", str(org_id))
            .execute()
        )
        return [ProjectOut(**row) for row in res.data]

    async def get_project(self, project_id: UUID) -> ProjectOut | None:
        res = (
            self.db.table("projects")
            .select("*")
            .eq("id", str(project_id))
            .single()
            .execute()
        )
        return ProjectOut(**res.data) if res.data else None

    async def create_project(self, org_id: UUID, data: ProjectCreate) -> ProjectOut:
        loc = data.location

        # Try geoportal lookup when a parcel number is provided
        bauzone = data.bauzone
        documents: list[dict] = []
        if data.parcel_number:
            geo = await lookup_parcel(data.parcel_number, loc.municipality, loc.canton)
            if not bauzone:
                bauzone = geo.get("bauzone")
            documents = geo.get("documents", [])

        payload = {
            "org_id": str(org_id),
            "name": data.name,
            "domain": data.domain,
            "location": loc.model_dump(),
            "status": "active",
            "parcel_number": data.parcel_number,
            "bauzone": bauzone,
        }
        res = self.db.table("projects").insert(payload).execute()
        project = ProjectOut(**res.data[0])

        # Auto-assign matching norms
        assign_norms_to_project(
            self.db,
            project_id=str(project.id),
            org_id=str(org_id),
            canton=loc.canton,
            municipality=loc.municipality,
            domain=data.domain,
        )

        assign_geoportal_norms_to_project(
            self.db,
            project_id=str(project.id),
            domain=data.domain,
            canton=loc.canton,
            municipality=loc.municipality,
            zone_label=bauzone,
            documents=documents,
        )

        return project

    async def delete_project(self, project_id: UUID) -> None:
        self.db.table("projects").delete().eq("id", str(project_id)).execute()
