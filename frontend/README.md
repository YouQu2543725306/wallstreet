# WallStreetQuad Frontend

A modern, responsive stock trading platform demo built with HTML, CSS, and JavaScript.

## Features

- **Modern Glassmorphism Design**: Clean, frosted glass effect with gradient backgrounds
- **Responsive Layout**: Adapts to desktop, tablet, and mobile devices
- **Interactive Modals**: Three functional modal dialogs for different operations
- **Real-time Data Display**: Stock prices, portfolio values, and transaction history
- **User-friendly Interface**: Intuitive navigation and clean component design

## Page Structure

The main page is organized into four distinct layers:

### First Layer (30% + 70% width)
- **Balance Section (30%)**: Displays total balance with wallet icon
- **Tracked Stocks (70%)**: Shows 3 tracked stocks with "Change Stock" button

### Second Layer (50% + 50% width)
- **My Wallet (50%)**: Line chart placeholder showing 6-month balance history
- **My Card (50%)**: Two credit cards with "Calculator" button

### Third Layer (100% width)
- **Transaction History**: List of buy/sell transactions without filters

### Fourth Layer (100% width)
- **My Holdings**: Table of user's stock holdings with "Add" button

## Modal Components

### 1. Calculator Modal
- **Trigger**: "Calculator" button in My Card section
- **Purpose**: Calculate potential revenue from stock investments
- **Fields**: Stock name, market price, buy quantity, duration
- **Output**: Approximate revenue calculation

### 2. Change Stock Modal
- **Trigger**: "Change Stock" button in Tracked Stocks section
- **Purpose**: Manage tracked stocks (remove existing, add new)
- **Features**: List current stocks with remove buttons, add new stock form

### 3. Add Holding Modal
- **Trigger**: "Add" button in My Holdings section
- **Purpose**: Add new stock holdings to portfolio
- **Fields**: Stock symbol, name, quantity, average cost, market

## File Structure

```
frontend/
├── index.html              # Main HTML file
├── styles.css              # Main stylesheet
├── modal-styles.css        # Modal-specific styles
├── scripts.js              # JavaScript functionality
├── components/             # Modal component files
│   ├── calculator-modal.html
│   ├── change-stock-modal.html
│   └── add-holding-modal.html
└── README.md              # This file
```

## Design Philosophy

- **Glassmorphism**: Semi-transparent components with backdrop blur
- **Consistent Spacing**: 30px gaps between sections, 20px between elements
- **Color Scheme**: Light blue gradient background (#a8c0ff to #b8a9c9)
- **Typography**: Inter font family for improved readability
- **Icons**: Font Awesome for consistent iconography

## Responsive Design

- **Desktop**: Full layout with all sections visible
- **Tablet**: Stacks sections vertically, adjusts card layout
- **Mobile**: Single column layout, optimized for touch interaction

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Usage

1. Open `index.html` in a modern web browser
2. Click the various buttons to interact with modals:
   - "Calculator" button in My Card section
   - "Change Stock" button in Tracked Stocks section
   - "Add" button in My Holdings section
3. Use Escape key or click outside modals to close them

## Development Notes

- Pure frontend implementation (no backend required for demo)
- Modular CSS structure with separated modal styles
- JavaScript handles modal interactions and form validation
- Placeholder data for demonstration purposes
- Ready for backend integration with API endpoints

## Future Enhancements

- Real-time stock data integration
- Advanced charting capabilities
- User authentication system
- Transaction processing
- Portfolio analytics
- Mobile app development 