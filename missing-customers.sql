-- Create all missing customers from Excel file

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'RGO Makelaars B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'RGO Makelaars B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Tex-Mex Streetfood', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Tex-Mex Streetfood');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Vishandel sperling', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Vishandel sperling');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'TOPHOLD International B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'TOPHOLD International B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Cronofy B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Cronofy B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Thema Timmerwerken', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Thema Timmerwerken');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Tibben Tapijt en', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Tibben Tapijt en');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Timmerfabriek Precisie 90', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Timmerfabriek Precisie 90');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Arian Snijders', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Arian Snijders');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'M Trompetter', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'M Trompetter');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Brink Eibergen B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Brink Eibergen B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Avifit Beauty Equipment BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Avifit Beauty Equipment BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'BRN Parket B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'BRN Parket B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'G.C. Lettinga', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'G.C. Lettinga');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'J.M. von Meijenfeldt-Boter', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'J.M. von Meijenfeldt-Boter');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'J.W. Scheffer', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'J.W. Scheffer');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'VvE Gezelstraat 3, 3A t/m 3D', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'VvE Gezelstraat 3, 3A t/m 3D');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Dickhoff Installaties', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Dickhoff Installaties');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Resu Beheer B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Resu Beheer B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Bakker Wijnand Vof', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Bakker Wijnand Vof');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Slagerij Boeve', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Slagerij Boeve');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Tolhuis ''n Tol', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Tolhuis ''n Tol');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Kindernet Deventer B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Kindernet Deventer B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'CC Nederland B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'CC Nederland B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'PIMM Solutions B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'PIMM Solutions B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'GMB (Geraedts Metaal', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'GMB (Geraedts Metaal');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Bruins Betonstaalvlechtbedrijf', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Bruins Betonstaalvlechtbedrijf');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Van Seters Metaaltechniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Van Seters Metaaltechniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Lasklus Nederland B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Lasklus Nederland B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Maco Metaal B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Maco Metaal B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Mulders Metaal op Maat', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Mulders Metaal op Maat');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Hauwlo Zonweringen', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Hauwlo Zonweringen');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Landman Siermetaal B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Landman Siermetaal B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Ruud van Laer las en montagewerk', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Ruud van Laer las en montagewerk');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Duinhouwer BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Duinhouwer BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'TVG Las- en Montagetechniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'TVG Las- en Montagetechniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Konstruktiebedrijf W. Verweij', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Konstruktiebedrijf W. Verweij');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'AL 13 Architectural Facades', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'AL 13 Architectural Facades');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Alutech Arnhem', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Alutech Arnhem');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'KO-MA Holding B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'KO-MA Holding B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'RS-Lastechniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'RS-Lastechniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Reparatiebedrijf H. Kelderman', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Reparatiebedrijf H. Kelderman');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'M. van Es', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'M. van Es');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Duinhouwer Onroerend Goed BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Duinhouwer Onroerend Goed BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'R. Schouten Beheer B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'R. Schouten Beheer B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'VR Steel', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'VR Steel');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Winters Metaaltechniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Winters Metaaltechniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Hofmeijer Las- en', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Hofmeijer Las- en');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Timmerman Techniek Assen B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Timmerman Techniek Assen B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Elektim-Techniek B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Elektim-Techniek B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Gelderland Hekwerken B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Gelderland Hekwerken B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Stephan Borgers', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Stephan Borgers');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Gartech', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Gartech');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Amuko Service', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Amuko Service');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'SH Vastgoed BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'SH Vastgoed BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Van der Kroon Metaal en', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Van der Kroon Metaal en');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'De Werelth', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'De Werelth');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'M.Oomen techniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'M.Oomen techniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'SLAGHUIS Veelzijdig in', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'SLAGHUIS Veelzijdig in');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'W. Verweij Beheer BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'W. Verweij Beheer BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'RBSS Vastgoed B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'RBSS Vastgoed B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Vermeulen Ingenieursbureau B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Vermeulen Ingenieursbureau B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Cristel vd sanden Interieur', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Cristel vd sanden Interieur');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'AanZet Staal-Bouw-Techniek B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'AanZet Staal-Bouw-Techniek B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'AanZet Holding B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'AanZet Holding B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'GB Hoogwerkers B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'GB Hoogwerkers B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'S. van Bergeijk Heftruck VOF', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'S. van Bergeijk Heftruck VOF');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Retsok Norg BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Retsok Norg BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Spin Pompen BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Spin Pompen BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Bakker Protech', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Bakker Protech');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Wildenborg Haardendesign B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Wildenborg Haardendesign B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'DKM Tec', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'DKM Tec');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Hinneman Engineering B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Hinneman Engineering B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Lift Products', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Lift Products');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'R. Schouten Beheer BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'R. Schouten Beheer BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Joosten Metaal', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Joosten Metaal');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Elbouw G/E Kombinatie BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Elbouw G/E Kombinatie BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'G. Leijten', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'G. Leijten');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'R Leijten', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'R Leijten');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Coach 27', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Coach 27');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Jeanneke Bosch Vakantie', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Jeanneke Bosch Vakantie');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Fidatrade BV', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Fidatrade BV');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Bercx Klimaattechniek', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Bercx Klimaattechniek');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Het Gouden Woud B.V.', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Het Gouden Woud B.V.');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'Van den Broek Hoveniersbedrijf', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'Van den Broek Hoveniersbedrijf');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'G.F.J. Pijnenburg', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'G.F.J. Pijnenburg');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'LTW Leenders en HGJ Gielen', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'LTW Leenders en HGJ Gielen');

INSERT INTO degoudse.customers (name, description, created_at, updated_at) 
SELECT 'P.J.G. Peeters', 'Customer created from Excel import', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM degoudse.customers WHERE name = 'P.J.G. Peeters');

