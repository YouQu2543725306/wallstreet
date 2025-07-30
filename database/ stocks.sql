-- =========================================
-- 1. Drop Existing Objects 
-- =========================================
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS company_info CASCADE;
DROP TABLE IF EXISTS world_stocks CASCADE;
DROP TABLE IF EXISTS tweet_stocks CASCADE;

DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;

-- =========================================
-- 2. Create ENUM Types for Transactions
-- =========================================
CREATE TYPE transaction_type AS ENUM ('BUY', 'SELL');
CREATE TYPE transaction_status AS ENUM ('ACTIVE', 'VOID');

-- =========================================
-- 3. Tweet Stocks Table (Raw Social Data)
-- =========================================
CREATE TABLE tweet_stocks (
    date DATE,
    company TEXT,
    sector TEXT,
    open DOUBLE PRECISION,
    high DOUBLE PRECISION,
    low DOUBLE PRECISION,
    close DOUBLE PRECISION,
    volume BIGINT,
    market_cap DOUBLE PRECISION,
    pe_ratio DOUBLE PRECISION,
    dividend_yield DOUBLE PRECISION,
    volatility DOUBLE PRECISION,
    sentiment_score DOUBLE PRECISION,
    trend TEXT
);

-- =========================================
-- 4. World Stocks Table (Market Data)
-- =========================================
CREATE TABLE world_stocks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL,
    open DOUBLE PRECISION,
    high DOUBLE PRECISION,
    low DOUBLE PRECISION,
    close DOUBLE PRECISION,
    volume BIGINT,
    brand_name TEXT,
    ticker TEXT NOT NULL,
    industry_tag TEXT,
    country TEXT,
    dividends DOUBLE PRECISION,
    stock_splits DOUBLE PRECISION
);

-- Ensure (ticker, date) is unique for price lookups
ALTER TABLE world_stocks ADD CONSTRAINT unique_ticker_date UNIQUE (ticker, date);

CREATE INDEX idx_world_stocks_ticker_date ON world_stocks(ticker, date DESC);

-- =========================================
-- 5. Cards Table (Payment Info)
-- =========================================
CREATE TABLE cards (
    card_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    card_number VARCHAR(19) NOT NULL UNIQUE CHECK (char_length(card_number) BETWEEN 13 AND 19),
    bank_name VARCHAR(50),
    balance NUMERIC(12, 2) DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sample cards
INSERT INTO cards (card_number, bank_name, balance, created_at)
VALUES
('4539123456789012', 'Chase Bank', 12000.00, '2021-07-28 14:30:00'),
('5399456789012345', 'Bank of America', 8500.00, '2021-07-28 14:45:00'),
('6011123456789012', 'Wells Fargo', 15000.00, '2021-07-28 15:00:00');

-- =========================================
-- 6. Company Info Table (From Tweets)
-- =========================================
CREATE TABLE company_info (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    sector TEXT,
    market_cap DOUBLE PRECISION,
    pe_ratio DOUBLE PRECISION,
    dividend_yield DOUBLE PRECISION,
    volatility DOUBLE PRECISION,
    sentiment_score DOUBLE PRECISION,
    trend TEXT,
    CONSTRAINT unique_date_name UNIQUE (date, name)
);

CREATE INDEX idx_company_info_date_name ON company_info(date, name);

-- Insert unique companies from tweet_stocks
INSERT INTO company_info (
    date, name, sector, market_cap, pe_ratio, dividend_yield, volatility, sentiment_score, trend
)
SELECT DISTINCT ON (t.date, t.company)
    t.date,
    t.company,
    t.sector,
    t.market_cap,
    t.pe_ratio,
    t.dividend_yield,
    t.volatility,
    t.sentiment_score,
    t.trend
FROM tweet_stocks t
ORDER BY t.date, t.company;

-- =========================================
-- 7. Transactions Table (Simulated Trades)
-- =========================================
CREATE TABLE transactions (
    transaction_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticker TEXT NOT NULL,
    trade_date DATE NOT NULL,
    type transaction_type NOT NULL,  -- BUY or SELL
    status transaction_status DEFAULT 'ACTIVE',
    price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_amount NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * price) STORED,
    card_id INT NOT NULL REFERENCES cards(card_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_ticker_date FOREIGN KEY (ticker, trade_date)
        REFERENCES world_stocks(ticker, date)
        ON DELETE RESTRICT
);

CREATE INDEX idx_transactions_ticker_date ON transactions(ticker, trade_date);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);

-- =========================================
-- 8. Insert Simulated BUY Transactions
-- =========================================
INSERT INTO transactions (ticker, trade_date, type, price, quantity, card_id)
SELECT
    w.ticker,
    w.date,
    'BUY'::transaction_type,
    ROUND(((w.high + w.low)/2)::numeric, 2),
    FLOOR(random() * 5 + 1)::INT,
    FLOOR(random() * 3 + 1)::INT
FROM world_stocks w
JOIN tweet_stocks t
    ON LOWER(w.brand_name) = LOWER(t.company)
   AND w.date = t.date;

-- =========================================
-- 9. Insert SELL Transactions (Next Available Date)
-- =========================================
INSERT INTO transactions (ticker, trade_date, type, price, quantity, card_id)
SELECT
    b.ticker,
    ws.date,
    'SELL'::transaction_type,
    ROUND((ws.close * (1 + (random() - 0.5)/10))::numeric, 2), -- Price near close
    GREATEST(1, FLOOR(b.quantity * (random() * 0.8 + 0.1))),
    FLOOR(random() * 3 + 1)::INT
FROM transactions b
JOIN LATERAL (
    SELECT date, close
    FROM world_stocks
    WHERE ticker = b.ticker AND date > b.trade_date
    ORDER BY date ASC
    LIMIT 1
) ws ON TRUE
WHERE b.type = 'BUY'
ORDER BY random()
LIMIT 100;
