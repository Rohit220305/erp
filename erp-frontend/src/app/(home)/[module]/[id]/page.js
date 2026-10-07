import { DynamicDetailPage } from '@/dynamicComponents/engines/DynamicDetailPage';
import { ModuleErrorBoundary } from '@/dynamicComponents/engines/ModuleErrorBoundary';

export default async function ModuleDetailPage({ params }) {
  const { module: moduleSlug, id: entityId } = await params;

  return (
    <ModuleErrorBoundary moduleName={moduleSlug}>
      <DynamicDetailPage moduleSlug={moduleSlug} entityId={entityId} />
    </ModuleErrorBoundary>
  );
}
