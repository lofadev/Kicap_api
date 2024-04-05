import mongoose from 'mongoose';

const AttributeModel = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayOrder: { type: Number, required: true },
});

const Attribute = mongoose.model('Attribute', AttributeModel);
export default Attribute;
