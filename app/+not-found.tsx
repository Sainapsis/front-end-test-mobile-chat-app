import React from 'react';
import { NotFoundTemplate } from '@/design_system/components/templates';

export default function NotFoundScreen() {
  return (
    <NotFoundTemplate
      title="This screen doesn't exist."
      linkText="Go to home screen!"
      linkHref="/"
    />
  );
}