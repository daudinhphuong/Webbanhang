import Setting from '../models/Setting.js'

export const getSetting = async (req, res) => {
  try {
    console.log('Getting settings...')
    const doc = await Setting.findOne({})
    console.log('Settings found:', doc)
    res.json(doc || {})
  } catch (e) {
    console.error('Error getting settings:', e)
    res.status(500).json({ message: e.message })
  }
}

export const upsertSetting = async (req, res) => {
  try {
    console.log('Received settings data:', req.body)
    console.log('User making request:', req.user)
    
    const update = req.body
    
    // Validate required fields
    if (!update || typeof update !== 'object') {
      return res.status(400).json({ message: 'No data provided' })
    }
    
    // Clean up undefined values
    const cleanedUpdate = Object.keys(update).reduce((acc, key) => {
      if (update[key] !== undefined) {
        acc[key] = update[key]
      }
      return acc
    }, {})
    
    console.log('Cleaned update data:', cleanedUpdate)
    
    const doc = await Setting.findOneAndUpdate(
      {}, 
      { $set: cleanedUpdate }, 
      { 
        new: true, 
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )
    
    console.log('Settings saved successfully:', doc)
    res.json({ 
      success: true, 
      message: 'Settings saved successfully',
      data: doc 
    })
  } catch (e) {
    console.error('Error saving settings:', e)
    console.error('Error stack:', e.stack)
    res.status(500).json({ 
      success: false,
      message: e.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? e.message : undefined
    })
  }
}


