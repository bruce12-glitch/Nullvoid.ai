import { EditorLayout } from "@/components/editor/EditorLayout";
import { Scene } from "@/components/canvas/Scene";

export default function CanvasWorkspacePage({ params }: { params: { id: string } }) {
  return (
    <EditorLayout projectId={params.id}>
      <Scene />
    </EditorLayout>
  );
}
