import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Exportação rápida de D:\APP_FLUXODECAIXA\fluxofinanceirohbs\src\lib\backup_data.ts
const clientesAntigos = [
    {
      "id": "f1c1c891-21fb-4d68-bde0-4f68891356fc",
      "nome": "Jaqueline Batista",
      "telefone": { "ddd": "73", "numero": "988324213" },
      "endereco": { "rua": "Rua 02", "numero": "26", "bairro": "Jaçanã", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "0076a628-8d58-465c-8cd6-754af629372b",
      "nome": "José Wilson",
      "telefone": { "ddd": "73", "numero": "981383113" },
      "endereco": { "rua": "Rua G", "numero": "70", "bairro": "Jardim Italamar", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Adm Obra Residencial",
    },
    {
      "id": "2cbeb977-cb14-446d-b664-51a3c47c3ef7",
      "nome": "Islana Alves dos Reis",
      "telefone": { "ddd": "73", "numero": "991098688" },
      "endereco": { "rua": "Rua A", "numero": "72", "bairro": "Jardim São João", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "14537309-d65b-452c-ac23-3ebeae352d4b",
      "nome": "Berta Cristina",
      "telefone": { "ddd": "73", "numero": "991130137" },
      "endereco": { "rua": "Rua Quero Quero", "numero": "270", "bairro": "Jd. das Hortências - Parque Verde", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "93123bbf-a4e6-4dd5-8528-f8857494f936",
      "nome": "Cássia Silva",
      "telefone": { "ddd": "", "numero": "988611436" },
      "endereco": { "rua": "Rua V", "numero": "", "bairro": "Novo São Caetano", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "06e8127f-9d4a-40ce-af67-e6a20d731210",
      "nome": "Franklin / Robinson",
      "telefone": { "ddd": "11", "numero": "985584747" },
      "endereco": { "rua": "Av. Aziz Maron", "numero": "330", "bairro": "Centro", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "4ceabc4c-4092-48d7-8646-1a35b8ba8ff2",
      "nome": "Laércio - Fernando",
      "telefone": { "ddd": "73", "numero": "988440804" },
      "endereco": { "rua": "Rua Getúlio Vargas", "numero": "155", "bairro": "Banco Raso", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Parcial - Alvará",
    },
    {
      "id": "75347d42-9215-446a-b6ca-f49138a1b311",
      "nome": "Tellyson - Cléa",
      "telefone": { "ddd": "73", "numero": "988470650" },
      "endereco": { "rua": "Rua E", "numero": "46", "bairro": "Jardim Alamar", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Total",
    },
    {
      "id": "ce041481-0b79-48c1-a9d0-de3d3f16c970",
      "nome": "Sambaía Construções Banco do Nordeste",
      "telefone": { "ddd": "99", "numero": "981100300" },
      "endereco": { "rua": "Av. Cinquentenário", "numero": "979", "bairro": "Centro", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Administração Obra",
    },
    {
      "id": "8ed79848-1b2e-4cfe-8e12-3b6187abd840",
      "nome": "Nicole Souza Rodrigues",
      "telefone": { "ddd": "71", "numero": "992710504" },
      "endereco": { "rua": "Rua Artur Leite da Silveira (Antiga Rua 04)", "numero": "120", "bairro": "Pontal", "cidade": "Ilhéus ", "estado": "BA" },
      "descricao": "Levantamento Planimétrico",
    },
    {
      "id": "17fa360e-74da-4505-b163-09980a9b73b4",
      "nome": "Emanoel Jr. Cotef",
      "telefone": { "ddd": "73", "numero": "999022402" },
      "endereco": { "rua": "Rua Piauí", "numero": "225", "bairro": "Jardim Vitória", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Elaboração de Projeto",
    },
    {
      "id": "ae872678-f976-4176-b451-154f74ad245c",
      "nome": "Hamilton Bandeira Corretor",
      "telefone": { "ddd": "73", "numero": "991383969" },
      "endereco": null,
      "descricao": "Despachante / Parceria",
    },
    {
      "id": "a5601e9e-63b3-4278-bf3d-fac2776ca18a",
      "nome": "Oliveira - Mirian Clea Souza de Oliveira",
      "telefone": { "ddd": "73", "numero": "999800356" },
      "endereco": { "rua": "Rua Monsenhor Moisés", "numero": "131", "bairro": "Pontalzinho", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Regularização Parcial - Alvará",
    },
    {
      "id": "726783f4-b079-446f-a353-57ac77b28fc1",
      "nome": "Tarik Fontes - Levantamento",
      "telefone": { "ddd": "73", "numero": "991427940" },
      "endereco": { "rua": "Av. Aziz Maron", "numero": "1141", "bairro": "Jardim Vitória", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Levantamento e Adequação de Projeto",
    },
    {
      "id": "c5466c76-eba5-4d4d-9c71-ea7187d14f15",
      "nome": "Ronaldo Bispo",
      "telefone": null,
      "endereco": { "rua": "Rua da feira", "numero": "", "bairro": "São Caetano", "cidade": "Itabuna", "estado": "BA" },
      "descricao": "Obtenção de licença de construção ",
    }
]

async function main() {
  console.log('Iniciando migração de clientes...')
  let importados = 0

  for (const c of clientesAntigos) {
    // Verificar se já existe (pra evitar duplicidade se rodar 2x)
    const existing = await prisma.cliente.findFirst({ where: { nome: c.nome } })
    if (existing) {
      console.log(`Cliente ${c.nome} já existe. Pulando...`)
      continue
    }

    const tel = c.telefone ? `(${c.telefone.ddd || ''}) ${c.telefone.numero || ''}`.trim() : ''
    
    await prisma.cliente.create({
      data: {
        nome: c.nome,
        cpf_cnpj: '000.000.000-00', // Padrão pois o outro não tinha CPF no backup
        telefone: tel,
        endereco: c.endereco?.rua || '',
        numero: c.endereco?.numero || '',
        bairro: c.endereco?.bairro || '',
        cidade: c.endereco?.cidade || '',
        estado: c.endereco?.estado || 'BA',
        observacoes: c.descricao || 'Importado do fluxo financeiro HBS',
      }
    })
    importados++
  }

  console.log(`Migração concluída! ${importados} clientes foram inseridos.`)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
