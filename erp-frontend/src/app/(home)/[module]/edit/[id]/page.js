import { DynamicFormPage } from '@/dynamicComponents/engines/DynamicFormPage';
import { ModuleErrorBoundary } from '@/dynamicComponents/engines/ModuleErrorBoundary';

export default async function ModuleEditPage({ params }) {
  const { module: moduleSlug, id: entityId } = await params;

  return (
    <ModuleErrorBoundary moduleName={moduleSlug}>
      <DynamicFormPage 
        moduleSlug={moduleSlug} 
        mode="edit"
        entityId={entityId}
      />
    </ModuleErrorBoundary>
  );
}
