const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    name: { type: String, trim: true },
    nome: { type: String, trim: true }, // retrocompatibilidade com registros legados
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    senha: { type: String }, // retrocompatibilidade com registros legados
    companyName: { type: String, default: '', trim: true },
    document: { type: String, default: '', trim: true },
    avatarUri: { type: String, default: null }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            ret.id = ret._id;
            ret.name = ret.name || ret.nome;
            ret.companyName = ret.companyName || '';
            ret.document = ret.document || '';
            ret.avatarUri = ret.avatarUri || null;
            delete ret.password;
            delete ret.senha;
            delete ret.__v;
            return ret;
        }
    }
});

// Middleware pre-save para sincronizar name/nome e password/senha
usuarioSchema.pre('save', function(next) {
    if (!this.name && this.nome) this.name = this.nome;
    if (!this.nome && this.name) this.nome = this.name;
    if (!this.password && this.senha) this.password = this.senha;
    if (!this.senha && this.password) this.senha = this.password;
    next();
});

module.exports = mongoose.model('Usuario', usuarioSchema);