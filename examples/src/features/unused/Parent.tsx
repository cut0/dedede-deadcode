import { UnusedChildren } from './Children';

export const UnusedParent: React.FC = () => {
  return (
    <div>
      Unused Parent
      <UnusedChildren />
    </div>
  );
};
