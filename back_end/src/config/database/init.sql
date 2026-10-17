CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  perfil ENUM('admin','associado') NOT NULL DEFAULT 'admin',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE associados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  cpf CHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  endereco VARCHAR(255),
  registro_pesca VARCHAR(50),        -- RGP
  data_filiacao DATE NOT NULL,
  status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE mensalidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  associado_id INT NOT NULL,
  competencia CHAR(7) NOT NULL,      -- 'AAAA-MM'
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  data_pagamento DATE NULL,
  status ENUM('pendente','pago','atrasado') NOT NULL DEFAULT 'pendente',
  UNIQUE (associado_id, competencia),
  FOREIGN KEY (associado_id) REFERENCES associados(id)
);