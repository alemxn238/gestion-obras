<div>
  <label className="block text-sm font-medium mb-1">Seleccionar o Crear Obra</label>
  <div className="space-y-2">
    <select
      value={obraId}
      onChange={(e) => setObraId(e.target.value)}
      className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="obra-1">Obra 1 (Ejemplo)</option>
      <option value="chalet-torrent">Chalet Torrent</option>
      <option value="piso-gran-via">Piso Gran Vía</option>
      <option value="nueva">+ Crear nueva obra...</option>
    </select>

    {/* Si elige crear nueva obra, muestra un campo de texto */}
    {obraId === 'nueva' && (
      <input
        type="text"
        required
        placeholder="Nombre o código de la nueva obra"
        onChange={(e) => setObraId(e.target.value)}
        className="w-full p-3 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
      />
    )}
  </div>
</div>