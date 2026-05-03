const { ObjectPoint } = require('../models');

// @route   GET /api/points
// @desc    Get all points grouped by tipe_objek
// @access  Public
exports.getAllPoints = async (req, res) => {
    try {
        const points = await ObjectPoint.findAll();

        // Grouping data by tipe_objek
        const groupedData = points.reduce((acc, point) => {
            const type = point.tipe_objek;
            if (!acc[type]) {
                acc[type] = [];
            }
            
            // Konversi ke format JSON dan tambahkan iconUrl (virtual field)
            const pointJson = point.toJSON();
            
            acc[type].push(pointJson);
            return acc;
        }, {});

        res.json({
            status: 'success',
            data: groupedData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/points/:id
// @desc    Get point by ID
// @access  Public
exports.getPointById = async (req, res) => {
    try {
        const point = await ObjectPoint.findByPk(req.params.id);

        if (!point) {
            return res.status(404).json({ message: 'Point tidak ditemukan' });
        }

        res.json({
            status: 'success',
            data: point
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/points
// @desc    Add new point
// @access  Private (Requires token)
exports.createPoint = async (req, res) => {
    const { nama, alamat, latitude, longitude, tipe_objek, atribut_tambahan } = req.body;

    try {
        const newPoint = await ObjectPoint.create({
            nama,
            alamat,
            latitude,
            longitude,
            tipe_objek,
            atribut_tambahan
        });

        res.json({
            status: 'success',
            message: 'Point berhasil ditambahkan',
            data: newPoint
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/points/:id
// @desc    Update point
// @access  Private (Requires token)
exports.updatePoint = async (req, res) => {
    const { nama, alamat, latitude, longitude, tipe_objek, atribut_tambahan } = req.body;

    try {
        let point = await ObjectPoint.findByPk(req.params.id);

        if (!point) {
            return res.status(404).json({ message: 'Point tidak ditemukan' });
        }

        point.nama = nama || point.nama;
        point.alamat = alamat || point.alamat;
        point.latitude = latitude || point.latitude;
        point.longitude = longitude || point.longitude;
        point.tipe_objek = tipe_objek || point.tipe_objek;
        point.atribut_tambahan = atribut_tambahan !== undefined ? atribut_tambahan : point.atribut_tambahan;

        await point.save();

        res.json({
            status: 'success',
            message: 'Point berhasil diupdate',
            data: point
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/points/:id
// @desc    Delete point
// @access  Private (Requires token)
exports.deletePoint = async (req, res) => {
    try {
        let point = await ObjectPoint.findByPk(req.params.id);

        if (!point) {
            return res.status(404).json({ message: 'Point tidak ditemukan' });
        }

        await point.destroy();

        res.json({
            status: 'success',
            message: 'Point berhasil dihapus'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
