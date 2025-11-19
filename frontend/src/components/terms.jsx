import React from 'react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#262624] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="relative mb-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#56a69f] to-[#56a69f]/70 bg-clip-text text-transparent">
              Monity
            </h1>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-[#56a69f] to-transparent rounded-full"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Termos de Serviço
          </h2>
          <div className="w-12 h-1 bg-gradient-to-r from-[#56a69f] to-[#56a69f]/50 mx-auto rounded-full"></div>
        </div>

        {/* Terms of Service Card */}
        <div className="bg-[#1F1E1D] backdrop-blur-xl rounded-2xl shadow-2xl border border-[#262626] p-6 md:p-8">
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Bem-vindo ao <span className="text-[#56a69f] font-semibold">Monity</span>. Ao acessar e utilizar nosso aplicativo disponível em{' '}
              <a
                href="https://app.monity-finance.com/"
                className="text-[#56a69f] hover:text-[#4a8f88] transition-colors duration-200 font-medium underline decoration-[#56a69f]/30 hover:decoration-[#56a69f]/60"
              >
                app.monity-finance.com
              </a>
              , você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso.
            </p>
            
            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Aceitação dos Termos
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Ao criar uma conta e utilizar o Monity, você confirma que leu, compreendeu e concorda em estar vinculado a estes Termos de Serviço. Se você não concordar com qualquer parte destes termos, não deverá utilizar nosso serviço. O uso continuado do aplicativo implica aceitação de quaisquer alterações feitas nestes termos.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Uso do Serviço
              </h3>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                O Monity é uma plataforma de gerenciamento de finanças pessoais. Você concorda em utilizar o serviço apenas para fins legais e de acordo com estes termos. É proibido:
              </p>
              <ul className="text-gray-300 text-base leading-relaxed space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Utilizar o serviço para qualquer finalidade ilegal ou não autorizada</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Tentar obter acesso não autorizado a qualquer parte do serviço</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Interferir ou interromper o funcionamento do serviço</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Transmitir vírus, malware ou qualquer código malicioso</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Contas de Usuário
              </h3>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                Para utilizar o Monity, você deve criar uma conta fornecendo informações precisas e completas. Você é responsável por:
              </p>
              <ul className="text-gray-300 text-base leading-relaxed space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Manter a confidencialidade de suas credenciais de acesso</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Todas as atividades realizadas em sua conta</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Notificar-nos imediatamente sobre qualquer uso não autorizado</span>
                </li>
              </ul>
              <p className="text-gray-300 text-base leading-relaxed">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos ou que permaneçam inativas por período prolongado.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Privacidade e Segurança
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                A proteção de seus dados é nossa prioridade. Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações financeiras. Seus dados são criptografados e armazenados com segurança. Para mais detalhes sobre como coletamos, usamos e protegemos suas informações, consulte nossa{' '}
                <a
                  href="/privacy"
                  className="text-[#56a69f] hover:text-[#4a8f88] transition-colors duration-200 font-medium underline decoration-[#56a69f]/30 hover:decoration-[#56a69f]/60"
                >
                  Política de Privacidade
                </a>
                .
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Limitação de Responsabilidade
              </h3>
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                O Monity é fornecido "como está" e "conforme disponível". Não garantimos que o serviço será ininterrupto, seguro ou livre de erros. Na extensão máxima permitida por lei:
              </p>
              <ul className="text-gray-300 text-base leading-relaxed space-y-2 ml-4 mb-4">
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Não nos responsabilizamos por decisões financeiras tomadas com base nas informações fornecidas pelo aplicativo</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Não somos responsáveis por perdas ou danos indiretos, incidentais ou consequentes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#56a69f] mr-2">•</span>
                  <span>Não garantimos a exatidão das análises e projeções financeiras geradas</span>
                </li>
              </ul>
              <p className="text-gray-300 text-base leading-relaxed">
                O Monity é uma ferramenta de organização financeira pessoal e não constitui assessoria financeira, fiscal ou jurídica profissional.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Modificações dos Termos
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Reservamo-nos o direito de modificar estes Termos de Serviço a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação no aplicativo. Recomendamos que você revise periodicamente estes termos. O uso continuado do serviço após quaisquer modificações constitui sua aceitação dos novos termos.
              </p>
            </div>

            <div className="bg-[#262626]/50 rounded-xl p-6 mb-6 border border-[#262626]/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <div className="w-2 h-2 bg-[#56a69f] rounded-full mr-3"></div>
                Lei Aplicável
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Estes Termos de Serviço são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-8 pt-6 border-t border-[#262626]">
              <div className="text-center">
                <p className="text-[#C2C0B6] text-sm mb-4">
                  Dúvidas sobre nossos termos de serviço?
                </p>
                <div className="inline-flex items-center px-4 py-2 bg-[#56a69f]/10 border border-[#56a69f]/20 rounded-lg">
                  <span className="text-[#56a69f] text-sm font-medium">
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

export default Terms;

