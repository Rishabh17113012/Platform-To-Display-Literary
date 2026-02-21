
-- Create enum for content types
CREATE TYPE public.content_type AS ENUM ('poem', 'story', 'quote');

-- Create writings table
CREATE TABLE public.writings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type content_type NOT NULL,
  genre TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pdf_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.writings ENABLE ROW LEVEL SECURITY;

-- Public can read published writings
CREATE POLICY "Anyone can read published writings"
  ON public.writings FOR SELECT
  USING (is_published = true);

-- Create admin role system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Admin policies for writings
CREATE POLICY "Admins can insert writings"
  ON public.writings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update writings"
  ON public.writings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete writings"
  ON public.writings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_writings_updated_at
  BEFORE UPDATE ON public.writings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.writings (title, content, type, genre) VALUES
('चाँदनी रात', 'चाँदनी रात में तन्हा खड़ा हूँ,
तारों से बातें करता जा रहा हूँ।
हर एक सितारा कहानी सुनाता है,
पुरानी यादों को फिर से जगाता है।

रात की ख़ामोशी में एक सुर बजता है,
दिल के तारों पर कोई गीत सजता है।
चाँदनी की चादर ओढ़े ये ज़मीन,
हर पल एक नया ख़्वाब बुनता है नवीन।', 'poem', 'Romance'),

('ज़िन्दगी का सफ़र', 'ज़िन्दगी का सफ़र है ये कैसा सफ़र,
कोई समझा नहीं, कोई जाना नहीं।
हर मोड़ पर एक नया इम्तिहान मिला,
हर गिरावट में एक नया आसमान मिला।

राहें बदलीं, मंज़िलें बदलीं,
पर हौसले कभी नहीं बदले।
ज़िन्दगी ने जो दिया है सबक,
वो किताबों में कभी नहीं मिले।', 'poem', 'Philosophy'),

('सपनों का शहर', 'एक शहर था जहाँ सपने बिकते थे। हर गली में एक दुकान, हर दुकान में एक ख़्वाब। लोग आते, सपने ख़रीदते, और चले जाते। कोई ख़ुशी का सपना लेता, कोई दौलत का, कोई प्यार का।

पर एक लड़का था जो कभी कुछ नहीं ख़रीदता। वो बस खड़ा रहता और देखता रहता। एक दिन दुकानदार ने पूछा - "तू कभी कुछ क्यों नहीं लेता?"

लड़के ने मुस्कुराकर कहा - "मेरे पास पहले से एक सपना है... ख़ुद का सपना। और वो किसी दुकान में नहीं मिलता।"', 'story', 'Inspiration'),

('वक़्त की स्याही', 'वक़्त की स्याही से लिखी जाती है ज़िन्दगी,
हर पन्ना एक नई कहानी कहता है।
जो बीत गया वो मिटता नहीं,
जो आने वाला है वो दिखता नहीं।', 'poem', 'Philosophy'),

('सच्ची ताक़त', 'सच्ची ताक़त वो नहीं जो दूसरों को झुकाए, सच्ची ताक़त वो है जो ख़ुद को खड़ा रखे जब पूरी दुनिया गिराने पर तुली हो।', 'quote', 'Motivation'),

('ख़ामोशी', 'कभी-कभी ख़ामोशी सबसे बड़ा जवाब होती है। जो समझते हैं, उन्हें शब्दों की ज़रूरत नहीं।', 'quote', 'Wisdom'),

('उम्मीद', 'अँधेरे से मत डरो, क्योंकि हर रात के बाद सुबह ज़रूर आती है। बस उम्मीद का दीया जलाए रखो।', 'quote', 'Inspiration'),

('कलम की ताक़त', 'कलम की ताक़त तलवार से ज़्यादा है, क्योंकि तलवार सिर्फ़ शरीर को काटती है, पर कलम दिलों को बदल देती है।', 'quote', 'Wisdom');
