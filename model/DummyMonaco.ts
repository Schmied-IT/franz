const pre = `# Franz

> `

const monacoFace = `
                                  @@@@@@   /                                    
                         &@@@@@@    @@@@@@@@@@@@@@@@@@@                         
                       @@@@   @@@@@@@@@@@@@@@@@@@@@@@@ #@@@                     
                    %@@@@@@@@@@,&@@@@@@@@@@@@@@@@@@@@@@@@@@@@                   
                  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@                 
                 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@@@@@@@                
               @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@    (@@@@@@@@@@@@@               
              @@@@@@@@@@@@@@@@@@@@@@@@@@@@&           @@@@@@@@@@@@#             
             @@@@@@@@@@@@@@@@@@@@@@@@@                 @@@@@@@@@@@@@            
            %@@@@@@@@@@@@                                @@@@@@@@@@@@           
            @@@@@@@@                                      @@@@@@@@@@@@          
            @@@@@&                                        ,@@@@@@@@@@@          
             @@@                                          @@@@@@@@@@@@@*        
            @&@@#                          ...             @@@@@@@@@@@@@        
             @@@@         (@@@@%     ,@@@@@@@@@@@@@@@@       @@@@@@@@@@@        
             @@@@   @@@@@@@@@@@@@      @@@@@@@@@@@@@          @@@@@@@@@@        
              (@#    @@% @@@ @@%@          ,                     @@@@@@         
               .@          &                                       @            
                                                                                
                                                                                
                                                                   .@           
                            @@  @      @@@                       #@@@@          
                           @       @@@@                          #@@@@@         
                  @@@                            *               @@@@@@,        
               @@@@@@@       @@@@@@@   @@@@@@@@                * @@@@@@@        
            @@@ @@@@@@@                                      @@  @@@@@@/@       
         &#@  @@@@@@@@@@                                   @@@  @#@@@@@@        
       @ (  @@@@@@@@@@@@@@                              @@  @     @@@@@@        
         ,@@@@@@@@@@@@@@@@@@                         @@@%  @.     @@@           
        @@@@@@@@@@@@@@@@@@@  @                    @@@@@    @      @@@%          
     @@@@@@@@@@@@@@   @@@@   @@@      *@(@@@@@@@@@@@     @       @@@@@@         
            @@@     @@@@@,    @@,     @@@@@@@@@@@@@@@@@&        @@@@@@          
          #        @@@@@@     @@@     *@@@@@@@@ .@@@@          *@               
                  @@@@@@       @@@         @     .                              
                    @@@        @@@@&                                            
                                @@@@@      ,.    
`;


const quotes = [
    `Komisch, ge?\nDa kannst krank sein wiest mogst und immer noch lockt das Weib.`,
    `"Wo is denn out momentan?"\n"Goetheplatz."`,
    `Ein rechter Scheißdreck war's!\nAltmodisch bis provinziell war's!\nDes war's!`,
    `Ich wollte Sie ja gar nicht ansprechen, Fräulein.\nIch wollte Sie ja nur fragen,\nob wir vielleicht eine Tasse Kaffe zusammen trinken wollen.`,
    `Aus is und gar is, und schad is, dass's wahr is!`,
    `Wie meinst Krise, Spatzl?`,
    `Geh Spatzl, schau wie I schau!\nRecht viel treuer schaut auch kein Schaf.`,
    `Bussi, Uschi!`,
    `Spatzl, es gibt Sachen im Leben und besonders im Fasching, die wenn man's nicht selber erlebt hat, glaubt man's fast selbst nicht.`,
    `Ehrlich gesagt, ich interessiere mich wahnsinnig für Frauen!`,
    `A bissel was geht immer!`
];

function getRandomQuote() {
    const i = Math.floor(Math.random() * quotes.length);
    return quotes[i];
}

export function getPlaceholderText(): string{
    const quote = getRandomQuote();
    const replaced = quote.replaceAll("\n", "\n> ");
    return pre + replaced + "\n\n```raw\n" +  monacoFace + "```\n";
}