# Confirmation Service

A generic confirmation service that replaces browser `confirm()` dialogs with beautiful Shadcn UI dialogs.

## Features

- ✅ **Beautiful UI**: Uses Shadcn Dialog component with proper styling
- ✅ **Awaitable**: Returns a Promise<boolean> for easy async/await usage
- ✅ **Customizable**: Configurable title, description, button text, and variants
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Reusable**: Can be used throughout the application

## Basic Usage

### 1. Using the raw confirm function

```tsx
import { useConfirm } from '@/providers/confirmProvider';

const MyComponent = () => {
  const { confirm } = useConfirm();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      // User clicked confirm
      await deleteItem();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
};
```

### 2. Using utility hooks

```tsx
import { useConfirmActions } from '@/hooks/useConfirmActions';

const MyComponent = () => {
  const { confirmDelete, confirmCancel, confirmAction } = useConfirmActions();

  const handleDelete = async () => {
    const confirmed = await confirmDelete('My Item');
    if (confirmed) {
      await deleteItem();
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirmCancel('operation');
    if (confirmed) {
      await cancelOperation();
    }
  };

  const handleCustomAction = async () => {
    const confirmed = await confirmAction(
      'Custom Action',
      'Are you sure you want to proceed?',
      'Proceed',
      'Cancel'
    );
    if (confirmed) {
      await performAction();
    }
  };

  return (
    <div>
      <button onClick={handleDelete}>Delete</button>
      <button onClick={handleCancel}>Cancel</button>
      <button onClick={handleCustomAction}>Custom Action</button>
    </div>
  );
};
```

## Available Options

### ConfirmOptions Interface

```tsx
interface ConfirmOptions {
  title?: string;           // Dialog title (default: 'Confirm Action')
  description?: string;     // Dialog description
  confirmText?: string;     // Confirm button text (default: 'Confirm')
  cancelText?: string;      // Cancel button text (default: 'Cancel')
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}
```

### Utility Functions

- `confirmDelete(itemName: string)` - For delete confirmations
- `confirmCancel(actionName: string)` - For cancel confirmations  
- `confirmAction(title, description, confirmText?, cancelText?)` - For general confirmations
- `confirmDangerousAction(title, description, confirmText?, cancelText?)` - For dangerous actions (red button)

## Examples

### Delete Confirmation
```tsx
const confirmed = await confirmDelete('User Profile');
if (confirmed) {
  await deleteUserProfile();
}
```

### Cancel Transfer
```tsx
const confirmed = await confirmCancel('transfer');
if (confirmed) {
  await cancelTransfer();
}
```

### Custom Action
```tsx
const confirmed = await confirmAction(
  'Publish Changes',
  'This will make your changes visible to all users. Continue?',
  'Publish',
  'Draft'
);
if (confirmed) {
  await publishChanges();
}
```

### Dangerous Action
```tsx
const confirmed = await confirmDangerousAction(
  'Reset Database',
  'This will permanently delete all data. This action cannot be undone.',
  'Reset Database',
  'Cancel'
);
if (confirmed) {
  await resetDatabase();
}
```

## Migration from browser confirm()

### Before
```tsx
if (!confirm('Are you sure you want to delete this item?')) {
  return;
}
await deleteItem();
```

### After
```tsx
const confirmed = await confirmDelete('item');
if (!confirmed) {
  return;
}
await deleteItem();
```

## Setup

The ConfirmProvider is already integrated in the main App component:

```tsx
// entrypoints/popup/App.tsx
<QueryProvider>
  <ConfirmProvider>
    <HashRouter>
      {/* Your app routes */}
    </HashRouter>
  </ConfirmProvider>
</QueryProvider>
```

No additional setup required!

