-- ===========================================================
-- MotoCars ERP
-- Carga inicial de modelos
-- ===========================================================

insert into public.modelos (marca_id, nombre, slug, orden)
select m.id, v.nombre, v.slug, v.orden
from public.marcas m
join (
    values
        -- Toyota
        ('Toyota', 'Corolla', 'corolla', 1),
        ('Toyota', 'Hilux', 'hilux', 2),
        ('Toyota', 'Yaris', 'yaris', 3),
        ('Toyota', 'Corolla Cross', 'corolla-cross', 4),

        -- Volkswagen
        ('Volkswagen', 'Amarok', 'amarok', 1),
        ('Volkswagen', 'Taos', 'taos', 2),
        ('Volkswagen', 'Polo', 'polo', 3),

        -- Ford
        ('Ford', 'Ranger', 'ranger', 1),
        ('Ford', 'Territory', 'territory', 2),

        -- Chevrolet
        ('Chevrolet', 'Tracker', 'tracker', 1),
        ('Chevrolet', 'S10', 's10', 2),

        -- Jeep
        ('Jeep', 'Renegade', 'renegade', 1),
        ('Jeep', 'Compass', 'compass', 2),

        -- Honda
        ('Honda', 'HR-V', 'hr-v', 1),
        ('Honda', 'Tornado', 'tornado', 2),

        -- RVM
        ('RVM', 'Tekken', 'tekken', 1),
        ('RVM', 'CZ', 'cz', 2),
        ('RVM', 'Rally', 'rally', 3),

        -- JAWA
        ('JAWA', 'RVM 500', 'rvm-500', 1)
) as v(marca, nombre, slug, orden)
on m.nombre = v.marca;