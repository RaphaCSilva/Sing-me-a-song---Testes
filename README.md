# <p align = "center"> Projeto Sing me a song - testes </p>

##  :clipboard: Descrição

Neste projeto foi entregue um front-end e back-end prontos, o objetivo da tarefa foi realizar os testes, utilizando testes de integração, testes de ponta a ponta e teste unitário

***
## :rocket: Comandos

### Antes de tudo

Após clonar o repositório, deve-se instalar os pacotes, tanto no front quanto no back

```yml
    cd back-end
    npm install
```

```yml
    cd front-end
    npm install
```

Após isso basta criar os arquivos .env e .env.test na pasta do back-end, seguindo os modelos do .env.example e .env.test.example e na pasta front-end apenas .env seguindo também o .env.test do front-end

### Testes de integração

Para os testes de integração, basta rodar o seguinte comando no back-end

```yml
    cd back-end
    npm run test:integration
```
### Testes unitários

Para os testes unitários, basta rodar o seguinte comando no back-end

```yml
    cd back-end
    npm run test:unit
```
### Testes de ponta a ponta 

Por fim, para os testes de ponta a ponta, é preciso abrir dois terminais, em um rodar o seguinte comando no back-end

```yml
    cd back-end
    npm run dev:test
```

No outro rodar o Cypress no front-end

```yml
    cd front-end
    npx cypress open
```
