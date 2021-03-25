import { Router } from 'express';
import  Knex  from '../database/connection';

const locationsRouter = Router();

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
})

export default locationsRouter;

