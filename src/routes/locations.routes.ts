import { Router } from 'express';
import multer from 'multer';
import  Knex  from '../database/connection';
import multerConfig from '../config/multer';

const locationsRouter = Router();

const upload = multer(multerConfig);

locationsRouter.get('/', async (req, res) =>{
    const { city, uf, items} = req.query;

    const parsedItems = <any> String(items).split(',').map(item => Number(item.trim()));

    const locations = await Knex('locations')
        .join('location_items', 'locations.id', '=', 'location_items.location_id')
        .whereIn('location_items.location_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('locations.*')

    return res.json(locations);
})

locationsRouter.get('/:id', async (req, res) =>{
    const { id } = req.params;

    const location = await Knex('locations').where('id', id).first();

    if(!location){
        return res.status(400).json({ message: 'Location not found.' });
    }

    const items = await Knex('items')
        .join('location_items', 'items.id', '=', 'location_items.item_id')
        .where('location_items.location_id', id)
        .select('items.title')

    return res.json({ location, items });
});

locationsRouter.post('/', async (req, res) => {
    const {
        nome,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf,
        items
    } = req.body;

    const location = {
        image: "fake-image.jpg",
        nome,
        email,
        whatsapp,
        latitude,
        longitude,
        city,
        uf
    };

    const transaction = await Knex.transaction();

    const newIds = await transaction('locations').insert(location);

    const location_id = newIds[0];

    const locationsItems = items.map(async ( item_id: number) => {
        const selectedItem = await transaction('items').where('id', item_id).first();

        if(!selectedItem){
            return res.status(400).json({ message: 'Item not found.' });
        }
        return {
            item_id,
            location_id
        }
    });

    await transaction('location_items').insert(locationsItems);

    await transaction.commit();

    return res.json({
        id: location_id,
        ...location
    });
});

locationsRouter.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;

    const image = req.file.filename;

    const location = await Knex('locations').where('id', id).first();

    if(!location){
        return res.status(400).json({ message: 'Location not found.' })
    }

    const locationUpdated = { ...location, image};

    await Knex('locations').update(locationUpdated).where('id', id);

    return res.json(locationUpdated);
});

export default locationsRouter;

