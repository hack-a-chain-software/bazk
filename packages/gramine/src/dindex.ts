const http = require('http');
const { StringDecoder } = require('string_decoder');

// Função principal modificada para remover dependências do Express
const main = async (command: any, args: any) => {
    // Sua lógica baseada no comando e argumentos
    console.log('Comando recebido:', command);
    console.log('Argumentos:', args);
    // Execute suas funções aqui baseadas no comando
};

const server = http.createServer((req: any, res: any) => {
    if (req.method === 'POST' && req.url === '/execute') {
        const decoder = new StringDecoder('utf-8');

        let buffer = '';

        req.on('data', (data: any) => {
            buffer += decoder.write(data);
        });

        req.on('end', () => {
            buffer += decoder.end();

            try {
                const receivedData = JSON.parse(buffer);
                const { command, args } = receivedData;

                // Chame a função principal ou outra função com os argumentos recebidos
                main(command, args).then(() => {
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: true, message: 'Comando executado com sucesso' }));
                }).catch((error) => {
                    res.writeHead(400, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({ success: false, message: error.message }));
                });

            } catch (error) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({ success: false, message: 'Erro ao processar os dados recebidos' }));
            }
        });
    } else {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({ success: false, message: 'Endpoint não encontrado' }));
    }
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
