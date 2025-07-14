-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  age_range TEXT NOT NULL CHECK (age_range IN ('10대', '20대', '30대', '40대', '50대', '60대+')),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  profile_image_option TEXT NOT NULL CHECK (profile_image_option IN ('social', 'upload')),
  profile_image_url TEXT,
  preferred_destinations TEXT[] NOT NULL DEFAULT '{}',
  travel_styles TEXT[] NOT NULL DEFAULT '{}',
  provider TEXT NOT NULL DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 프로필만 읽기 가능
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 정책 생성: 사용자는 자신의 프로필만 생성 가능
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 정책 생성: 사용자는 자신의 프로필만 업데이트 가능
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 정책 생성: 사용자는 자신의 프로필만 삭제 가능
CREATE POLICY "Users can delete own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 시간 자동 갱신 트리거
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider ON user_profiles(provider);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at); 