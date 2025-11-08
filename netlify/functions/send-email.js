const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.handler = async (event, context) => {
  // Verificar que existe la API key de Resend
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY no está configurada');
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Configuración del servidor incompleta' 
      })
    };
  }

  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    // Parsear el body
    const { nombre, email, mensaje } = JSON.parse(event.body);

    // Validación básica
    if (!nombre || !email || !mensaje) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Todos los campos son requeridos' 
        })
      };
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Email inválido' 
        })
      };
    }

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send({
      from: 'BJM Portfolio <noreply@bjmdesigns.com>',
      to: [process.env.CONTACT_EMAIL || 'imfrann66@gmail.com'], // Usa variable de entorno
      subject: `Nuevo mensaje de ${nombre} desde tu portfolio`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">
              📧 Nuevo Mensaje - BJM Portfolio
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px; background-color: #ffffff; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Contact Info -->
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #000000;">
              <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Información de Contacto</h2>
              <p style="margin: 8px 0; color: #555555;"><strong>👤 Nombre:</strong> ${nombre}</p>
              <p style="margin: 8px 0; color: #555555;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #000000; text-decoration: none;">${email}</a></p>
            </div>
            
            <!-- Message -->
            <div style="margin-bottom: 25px;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 16px;">💬 Mensaje:</h3>
              <div style="background-color: #ffffff; padding: 20px; border: 2px solid #e9ecef; border-radius: 8px; line-height: 1.6; color: #333333;">
                ${mensaje.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="mailto:${email}?subject=Re: Consulta desde BJM Portfolio" 
                 style="background: linear-gradient(135deg, #000000 0%, #333333 100%); color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                📩 Responder Email
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="text-align: center; margin-top: 20px; padding: 20px;">
            <p style="color: #888888; font-size: 14px; margin: 0;">
              Este mensaje fue enviado desde tu portfolio web<br>
              <strong>BJM Designs</strong>
            </p>
            <div style="margin-top: 15px;">
              <span style="color: #cccccc; font-size: 12px;">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</span>
            </div>
          </div>
        </div>
      `,
      replyTo: email,
    });

    if (error) {
      console.error('Error enviando email:', error);
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ 
          success: false, 
          message: 'Error interno del servidor' 
        })
      };
    }

    console.log('Email enviado exitosamente:', data);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: true, 
        message: 'Mensaje enviado correctamente',
        id: data?.id 
      })
    };

  } catch (error) {
    console.error('Error en función:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: false, 
        message: 'Error interno del servidor' 
      })
    };
  }
};