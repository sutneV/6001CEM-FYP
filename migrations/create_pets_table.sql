-- Create enum types for pets
CREATE TYPE pet_type AS ENUM ('dog', 'cat', 'rabbit', 'bird', 'other');
CREATE TYPE pet_size AS ENUM ('small', 'medium', 'large', 'xlarge');
CREATE TYPE pet_age AS ENUM ('baby', 'young', 'adult', 'senior');
CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE pet_status AS ENUM ('available', 'pending', 'adopted');

-- Create pets table
CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shelter_id UUID NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type pet_type NOT NULL,
    breed VARCHAR(255),
    age pet_age NOT NULL,
    gender pet_gender NOT NULL,
    size pet_size,
    weight INTEGER, -- in kg
    color VARCHAR(255),
    description TEXT NOT NULL,
    story TEXT,
    images JSON DEFAULT '[]'::json,
    -- Health information
    vaccinated BOOLEAN DEFAULT false,
    neutered BOOLEAN DEFAULT false,
    microchipped BOOLEAN DEFAULT false,
    -- Behavioral information
    house_trained BOOLEAN DEFAULT false,
    good_with_kids BOOLEAN DEFAULT false,
    good_with_dogs BOOLEAN DEFAULT false,
    good_with_cats BOOLEAN DEFAULT false,
    -- Special needs
    special_needs BOOLEAN DEFAULT false,
    special_needs_description TEXT,
    -- Status
    status pet_status NOT NULL DEFAULT 'available',
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_pets_shelter_id ON pets(shelter_id);
CREATE INDEX idx_pets_type ON pets(type);
CREATE INDEX idx_pets_status ON pets(status);
CREATE INDEX idx_pets_age ON pets(age);
CREATE INDEX idx_pets_size ON pets(size);
CREATE INDEX idx_pets_created_at ON pets(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pets_updated_at 
    BEFORE UPDATE ON pets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();