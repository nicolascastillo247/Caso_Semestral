texto="caractaristica:standar;cuerpo:caoba maciza;mastil:caoba slim;diapasón:palorrosa;trastes:22;radio:12;ancho:42;acabado:brillante;clavijas:diecast;cuerdas:acero;puente:fijo;pastillas:humbucker;selector:3 posiciones;controles:volumen y tono;color:natural"
caracteristicas=texto.split(";")
for caracteristica in caracteristicas:
    clave, valor = caracteristica.split(":")
    print(f"{valor}")  
    
    