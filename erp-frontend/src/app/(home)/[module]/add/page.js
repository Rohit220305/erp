import { DynamicFormPage } from '@/dynamicComponents/engines/DynamicFormPage';
import { ModuleErrorBoundary } from '@/dynamicComponents/engines/ModuleErrorBoundary';

export default async function ModuleAddPage({ params }) {
  const { module: moduleSlug } = await params;

  return (
    <ModuleErrorBoundary moduleName={moduleSlug}>
      <DynamicFormPage 
        moduleSlug={moduleSlug} 
        mode="create" 
      />
    </ModuleErrorBoundary>
  );
}
