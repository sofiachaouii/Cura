-- Drop existing tables if they exist
DROP TABLE IF EXISTS values_responses;
DROP TABLE IF EXISTS values;

-- Create value_statements table with UUID and correct column name
CREATE TABLE IF NOT EXISTS value_statements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create values_responses table
CREATE TABLE IF NOT EXISTS values_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    statement_id UUID NOT NULL REFERENCES value_statements(id),
    stance TEXT NOT NULL CHECK (stance IN ('for', 'against')),
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, statement_id, created_at)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_values_responses_user_id ON values_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_values_responses_statement_id ON values_responses(statement_id);
CREATE INDEX IF NOT EXISTS idx_values_responses_created_at ON values_responses(created_at);

-- Insert some sample values statements
INSERT INTO value_statements (text) VALUES
('It is better to be kind than to be right.'),
('Technology is making us less human.'),
('The purpose of education is to prepare students for the workforce.'),
('Social media has more negative than positive effects on society.'),
('The government should provide universal basic income.'),
('Climate change is the most pressing issue facing humanity today.'),
('The death penalty should be abolished worldwide.'),
('Artificial intelligence will eventually surpass human intelligence in all domains.'),
('The benefits of globalization outweigh its drawbacks.'),
('The right to free speech should be absolute, even for hate speech.'); 