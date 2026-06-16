// src/middleware/autorizar.js
// RF-03: RBAC parametrizável — trabalha apenas com req.usuario.papel,
// sem consultas ao banco.

export function autorizar(...papeis) {
  return (req, res, next) => {
    if (!papeis.includes(req.usuario.papel)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    next();
  };
}
