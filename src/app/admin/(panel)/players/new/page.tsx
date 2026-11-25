import PlayerForm from "@/components/admin/PlayerForm";
import { requireAdmin } from "@/lib/supabaseServer";

export default async function NewPlayerPage() {
  await requireAdmin();
  return (
    <div>
      <h1 className="font-display text-5xl">Add player</h1>
      <p className="mt-2 text-sm text-muted">
        After adding, open the player to credit any appearances they made as a guest.
      </p>
      <div className="mt-8">
        <PlayerForm
          mode="create"
          initial={{
            id: "",
            name: "",
            number: null,
            position: "Midfielder",
            captain: false,
            active: true,
            photo_path: null,
            sort_order: null,
          }}
        />
      </div>
    </div>
  );
}
