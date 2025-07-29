# WallStreetQuad Frontend

A modern stock trading platform demo with a beautiful gradient blue background and white components.

## Features

- 🎨 **Modern Design**: Gradient blue background with white glassmorphism components
- 📱 **Responsive Layout**: Optimized for desktop and mobile devices
- 💼 **Stock Trading Interface**: Track stocks and manage portfolio
- 📊 **Balance Overview**: Display total balance, available cash, and portfolio value
- 💳 **Wallet & Card Management**: Manage payment methods and transactions
- 📋 **Transaction History**: Detailed transaction records and holdings

## Page Structure

### Navigation Bar
- WallStreetQuad brand logo
- Navigation menu (Dashboard, Trade, Portfolio, History)
- User information display

### Balance Section
- **Total Balance**: Overall account value with change percentage
- **Available Cash**: Ready-to-trade cash amount
- **Portfolio Value**: Current investment portfolio value

### Tracked Stocks Section
- **Stock Cards**: Display 3 tracked stocks (AAPL, TSLA, MSFT)
- **Real-time Prices**: Current price and daily change
- **Mini Charts**: Placeholder for stock charts
- **Add Stock Button**: Add new stocks to tracking list

### My Wallet Section
- **Primary Account**: Bank account information
- **Account Balance**: Available funds
- **Action Buttons**: Add funds and transfer options

### My Card Section
- **Credit Card Display**: Visual credit card with details
- **Card Information**: Card type, daily limit, and status
- **Card Details**: Card number, holder name, expiry date

### Transaction History Section
- **Transaction List**: Recent buy/sell transactions
- **Filter Options**: Filter by All, Buy, or Sell
- **Transaction Details**: Amount, date, and status

### My Holdings Section
- **Holdings Table**: Detailed portfolio holdings
- **Stock Information**: Company name, symbol, market
- **Portfolio Metrics**: Quantity, average cost, current price, market value, P&L
- **Action Buttons**: Trade options for each holding

## Technical Features

- **Pure Frontend**: No backend required to run
- **CSS Grid & Flexbox**: Modern layout techniques
- **Glassmorphism**: Glass effect design with backdrop blur
- **Font Awesome**: Rich icon library
- **Google Fonts**: Inter font for better readability

## Usage

1. Open `index.html` directly in your browser
2. All styles and fonts will load automatically
3. All interactive elements have hover effects

## Future Development

This frontend is ready for backend integration:

- Stock charts can be integrated with real charting libraries (Chart.js, TradingView, etc.)
- Transaction forms can connect to backend APIs
- Holdings data can be loaded dynamically from database
- Real-time price updates can be added

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## File Structure

```
frontend/
├── index.html      # Main page
├── styles.css      # Stylesheet
└── README.md       # Documentation
```

## Design Philosophy

The interface follows a clean, modern design with:
- Gradient blue background for visual appeal
- White semi-transparent components for readability
- Consistent spacing and typography
- Smooth animations and transitions
- Mobile-first responsive design 