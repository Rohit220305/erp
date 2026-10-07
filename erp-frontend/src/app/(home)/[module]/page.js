import { DynamicModuleListPage } from '@/dynamicComponents/engines/DynamicModuleListPage';
import { ModuleErrorBoundary } from '@/dynamicComponents/engines/ModuleErrorBoundary';

export default async function ModuleListPage({ params }) {
  const { module: moduleSlug } = await params;

  return (
    <ModuleErrorBoundary moduleName={moduleSlug}>
      <DynamicModuleListPage moduleSlug={moduleSlug} />
    </ModuleErrorBoundary>
  );
}
