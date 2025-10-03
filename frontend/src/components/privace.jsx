import React from 'react';

const Privace = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#01C38D] to-[#01C38D]/70 bg-clip-text text-transparent">
              Monity
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#01C38D] to-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Política de Privacidade
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#01C38D] to-[#01C38D]/50 mx-auto rounded-full"></div>
        </div>

        {/* Privacy Policy Card */}
        <div className="bg-[#171717] backdrop-blur-xl rounded-2xl shadow-2xl border border-[#262626] p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              A sua privacidade é importante para nós. É política do <span className="text-[#01C38D] font-semibold">Monity</span> respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site{' '}
              <a 
                href="https://firstmoniry.vercel.app/" 
                className="text-[#01C38D] hover:text-[#01A071] transition-colors duration-200 font-medium underline decoration-[#01C38D]/30 hover:decoration-[#01C38D]/60"
              >
                Monity
              </a>
              , e outros sites que possuímos e operamos.
            </p>
            
            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#01C38D] rounded-full mr-3"></div>
                Coleta de Informações
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#01C38D] rounded-full mr-3"></div>
                Armazenamento e Proteção
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis ​​para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#01C38D] rounded-full mr-3"></div>
                Compartilhamento de Dados
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-8 pt-6 border-t border-[#262626]">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4">
                  Dúvidas sobre nossa política de privacidade?
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-[#01C38D]/10 border border-[#01C38D]/20 rounded-lg">
                  <span className="text-[#01C38D] text-sm font-medium">
                    Entre em contato conosco
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privace;
