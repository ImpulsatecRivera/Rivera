import nodemailer from "nodemailer"
import { config } from "../config.js"

const trans = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: true,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
});

const EnviarEmail = async (to, subject, body, html) => {
    try {
        const info = await trans.sendMail({
            from: "impulsatec21@gmail.com",
            to,
            subject,
            text: body,   
            html
            // Removido: attachments con la imagen
        });
        return info;
    } catch (error) {
        console.log("Error al enviar el correo: " + error);
        throw error;
    }
};

const html = (codigo) => {
    return `
    <!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Recuperación de Cuenta - RIVERA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 40px 30px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-bottom: 3px solid #2e8bc0;
        }
        
        /* Logo texto en lugar de imagen */
        .logo-text {
            font-size: 36px;
            font-weight: 900;
            color: #2e8bc0;
            margin-bottom: 10px;
            letter-spacing: 3px;
            text-shadow: 2px 2px 4px rgba(46, 139, 192, 0.1);
        }
        
        .company-subtitle {
            font-size: 14px;
            color: #6c757d;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .content {
            padding: 40px 35px;
        }
        
        .content h2 {
            color: #2e8bc0;
            text-align: center;
            margin-bottom: 30px;
            font-size: 28px;
            font-weight: 700;
        }
        
        .code-container {
            margin: 40px 0;
            text-align: center;
            background: linear-gradient(135deg, #e3f2fd 0%, #f0f8ff 100%);
            padding: 35px 25px;
            border-radius: 15px;
            border: 2px dashed #2e8bc0;
            position: relative;
        }
        
        .code-container::before {
            content: '🔐';
            position: absolute;
            top: -15px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 5px 10px;
            font-size: 20px;
            border-radius: 50%;
            border: 2px solid #2e8bc0;
        }
        
        .recovery-code {
            font-size: 40px;
            font-weight: 900;
            letter-spacing: 10px;
            color: #1565c0;
            padding: 25px 35px;
            background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
            border-radius: 10px;
            display: inline-block;
            box-shadow: 0 6px 25px rgba(46, 139, 192, 0.15);
            border: 2px solid #2e8bc0;
            font-family: 'Courier New', monospace;
        }
        
        .code-label {
            color: #2e8bc0;
            font-weight: 700;
            margin-bottom: 20px;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .instructions {
            margin-bottom: 30px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 10px;
            border-left: 5px solid #2e8bc0;
        }
        
        .instructions p {
            margin-bottom: 15px;
        }
        
        .warning-box {
            background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
            border: 2px solid #ffc107;
            color: #856404;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            position: relative;
        }
        
        .warning-box::before {
            content: '⚠️';
            position: absolute;
            top: -12px;
            left: 20px;
            background: #fff3cd;
            padding: 5px;
            font-size: 18px;
        }
        
        .security-box {
            background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
            border: 2px solid #4caf50;
            color: #2e7d32;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            position: relative;
        }
        
        .security-box::before {
            content: '🛡️';
            position: absolute;
            top: -12px;
            left: 20px;
            background: #e8f5e8;
            padding: 5px;
            font-size: 18px;
        }
        
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2e8bc0 0%, #1976d2 100%);
            color: white;
            text-decoration: none;
            padding: 18px 40px;
            border-radius: 30px;
            font-weight: 700;
            margin-top: 25px;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px rgba(46, 139, 192, 0.3);
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
        }
        
        .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 25px rgba(46, 139, 192, 0.4);
        }
        
        .contact-section {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 25px;
            border-radius: 12px;
            margin-top: 30px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        
        .contact-section h4 {
            color: #2e8bc0;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .contact-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .contact-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        }
        
        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #6c757d;
            background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
            color: white;
        }
        
        .footer a {
            color: #74b9ff;
            text-decoration: none;
        }
        
        .footer a:hover {
            text-decoration: underline;
        }
        
        .company-info {
            margin-bottom: 20px;
            font-weight: 600;
            font-size: 16px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .logo-text {
                font-size: 28px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .recovery-code {
                font-size: 32px;
                letter-spacing: 6px;
                padding: 20px 25px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-text">🚛 RIVERA 🚛</div>
            <div class="company-subtitle">Distribuidora y Transporte</div>
        </div>
        <div class="content">
            <h2>🔐 Código de Recuperación de Cuenta</h2>
            
            <div class="instructions">
                <p><strong>¡Hola estimado usuario!</strong></p>
                <p>Hemos recibido una solicitud para recuperar el acceso a tu cuenta en el sistema de <strong>RIVERA Distribuidora y Transporte</strong>.</p>
                <p>Por tu seguridad y la de nuestro sistema, utiliza el siguiente código para completar el proceso de recuperación:</p>
            </div>
            
            <div class="code-container">
                <div class="code-label">Tu Código de Recuperación</div>
                <div class="recovery-code">${codigo}</div>
            </div>
            
            <div class="security-box">
                <strong>🛡️ Información de Seguridad:</strong><br><br>
                • Este código expirará en <strong>30 minutos</strong> por razones de seguridad<br>
                • Solo puede ser utilizado una vez<br>
                • Mantenlo confidencial y no lo compartas con terceros<br>
                • Si no reconoces esta solicitud, contacta inmediatamente a soporte
            </div>
            
            <div class="warning-box">
                <strong>⚠️ ¿No solicitaste este código?</strong><br><br>
                Si no realizaste esta solicitud de recuperación, puedes ignorar este correo de forma segura. Sin embargo, si tienes preocupaciones sobre la seguridad de tu cuenta, te recomendamos contactar inmediatamente a nuestro equipo de soporte técnico.
            </div>
            
            <div class="contact-section">
                <h4>💬 ¿Necesitas Ayuda?</h4>
                <p>Nuestro equipo de soporte técnico de RIVERA está disponible para asistirte</p>
                
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>📧 Email</strong><br>
                        soporte@rivera-transporte.com
                    </div>
                    <div class="contact-item">
                        <strong>📞 Teléfono</strong><br>
                        +503 2XXX-XXXX
                    </div>
                    <div class="contact-item">
                        <strong>🕐 Horario</strong><br>
                        Lun-Vie: 8:00 AM - 6:00 PM
                    </div>
                </div>
                
                <a href="#" class="button">🏠 Acceder al Sistema</a>
            </div>
        </div>
        
        <div class="footer">
            <div class="company-info">
                🚛 RIVERA - Distribuidora y Transporte 🚛
            </div>
            <p>Este es un mensaje automático generado por nuestro sistema de seguridad.</p>
            <p>Por favor, no respondas directamente a este correo electrónico.</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.2); margin: 20px 0;">
            <p>&copy; 2025 RIVERA Distribuidora y Transporte. Todos los derechos reservados.</p>
            <p>
                <a href="#">Política de Privacidad</a> | 
                <a href="#">Términos de Servicio</a> | 
                <a href="#">Contacto</a> | 
                <a href="#">Soporte Técnico</a>
            </p>
        </div>
    </div>
</body>
</html>
    `
}

export {EnviarEmail, html};