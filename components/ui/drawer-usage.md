# Shadcn Drawer Component Usage Guide

The Drawer component is a reusable bottom sheet that slides up from the bottom of the screen using the Vaul library. It's perfect for displaying detailed information, forms, or any content that needs to be shown as an overlay.

## Basic Usage

```tsx
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { useDrawer } from '@/hooks/useDrawer';

const MyComponent = () => {
  const { open, setOpen } = useDrawer();

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open Drawer</button>
      
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>My Drawer</DrawerTitle>
          </DrawerHeader>
          <div className="p-6">
            <h3>Drawer Content</h3>
            <p>This is the content inside the drawer.</p>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
```

## Components

The shadcn drawer consists of several components:

- `Drawer` - The root component that wraps everything
- `DrawerContent` - The main content container
- `DrawerHeader` - Header section with title and description
- `DrawerTitle` - The title component
- `DrawerDescription` - Optional description component
- `DrawerFooter` - Footer section for actions
- `DrawerClose` - Close button component
- `DrawerTrigger` - Trigger component to open the drawer

## Props

### Drawer Root
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls whether the drawer is visible |
| `onOpenChange` | `(open: boolean) => void` | - | Function called when drawer state changes |
| `direction` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Direction the drawer slides from |

## Features

- **Smooth animations**: Slides up from bottom with smooth transitions
- **Backdrop blur**: Semi-transparent backdrop with blur effect
- **Keyboard support**: Close with Escape key
- **Touch friendly**: Handle bar for better UX
- **Responsive**: Adapts to different screen sizes
- **Scrollable content**: Content area scrolls when needed
- **Body scroll lock**: Prevents background scrolling when open

## Advanced Usage Examples

### With Custom Content Component

```tsx
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle 
} from '@/components/ui/drawer';
import { TransactionDetails } from '@/components/asset/TransactionDetails';

const AssetPage = () => {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { open, setOpen } = useDrawer();

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setOpen(true);
  };

  return (
    <div>
      {/* Your transaction list */}
      <div onClick={() => handleTransactionClick(transaction)}>
        Transaction Item
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Transaction Details</DrawerTitle>
          </DrawerHeader>
          {selectedTransaction && (
            <TransactionDetails 
              transaction={selectedTransaction}
              asset={asset}
              onClose={() => setOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};
```

### Without Header

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent>
    <div className="p-6">
      <h3>Custom Header</h3>
      <button onClick={() => setOpen(false)}>Custom Close</button>
    </div>
  </DrawerContent>
</Drawer>
```

### With Custom Styling

```tsx
<Drawer open={open} onOpenChange={setOpen}>
  <DrawerContent className="max-w-lg">
    <DrawerHeader>
      <DrawerTitle>Custom Styled Drawer</DrawerTitle>
    </DrawerHeader>
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      Custom styled content
    </div>
  </DrawerContent>
</Drawer>
```

## Best Practices

1. **Use the `useDrawer` hook** for consistent state management
2. **Keep content focused** - drawers work best for specific tasks or details
3. **Provide clear close actions** - users should always know how to close the drawer
4. **Consider mobile UX** - ensure content is touch-friendly and scrollable
5. **Use appropriate titles** - help users understand what the drawer contains
6. **Handle loading states** - show loading indicators for async content

## Accessibility

The drawer component includes several accessibility features:
- Keyboard navigation support (Escape to close)
- Focus management
- ARIA attributes for screen readers
- High contrast support
- Touch-friendly interactions
