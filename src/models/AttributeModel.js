import mongoose from 'mongoose';

const AttributeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayOrder: { type: Number, required: true },
});

const Attribute = mongoose.model('Attribute', AttributeSchema);
export default Attribute;
