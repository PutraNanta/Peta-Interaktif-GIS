const { MasterTipe } = require('../models');

exports.getAllMasterTipes = async (req, res) => {
    try {
        const types = await MasterTipe.findAll();
        res.json({
            status: 'success',
            data: types
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: 'error', message: 'Server Error' });
    }
};
