package com.licenta.rezervari.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void trimiteCodeVerificareEmail(String catre, String cod) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#2563eb 0%%,#1d4ed8 100%%);padding:36px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Rezervă simplu. Trăiești liber.</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;font-weight:600;">Confirmă adresa de email</h2>
                        <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                          Bun venit pe <strong>Rezervo</strong>! Contul tău a fost creat cu succes.
                          Folosește codul de mai jos pentru a-ți confirma adresa de email și a activa contul.
                        </p>

                        <!-- Cod -->
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:8px 0 28px;">
                              <div style="display:inline-block;background:#eff6ff;border:2px dashed #2563eb;border-radius:10px;padding:18px 40px;">
                                <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#2563eb;font-family:monospace;">%s</span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:28px;">
                          <tr>
                            <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                              ⏱ Codul este valabil <strong>15 minute</strong> de la primirea acestui email.
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                          Dacă nu tu ai creat acest cont, poți ignora acest email în siguranță.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">
                          &copy; 2025 Rezervo &mdash; Acest email a fost generat automat, te rugăm să nu răspunzi.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(cod);

        trimiteMail(catre, "Confirmă adresa de email — Rezervo", html);
    }

    public void trimiteCodeProprietar(String catre, String cod) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a73e8 0%%,#0d47a1 100%%);padding:36px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Platforma ta de rezervări</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;font-weight:600;">Activare cont Proprietar</h2>
                        <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">
                          Ai solicitat activarea rolului de <strong>Proprietar</strong> pe platforma Rezervo.
                          Folosește codul de mai jos pentru a finaliza procesul.
                        </p>

                        <!-- Cod -->
                        <table width="100%%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding:8px 0 28px;">
                              <div style="display:inline-block;background:#f0f4ff;border:2px dashed #1a73e8;border-radius:10px;padding:18px 40px;">
                                <span style="font-size:36px;font-weight:700;letter-spacing:10px;color:#1a73e8;font-family:monospace;">%s</span>
                              </div>
                            </td>
                          </tr>
                        </table>

                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;margin-bottom:28px;">
                          <tr>
                            <td style="padding:12px 16px;color:#92400e;font-size:13px;">
                              ⏱ Codul este valabil <strong>15 minute</strong> de la primirea acestui email.
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                          Dacă nu ai solicitat tu această schimbare, poți ignora acest email în siguranță.
                          Contul tău nu va fi modificat.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">
                          &copy; 2025 Rezervo &mdash; Acest email a fost generat automat, te rugăm să nu răspunzi.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(cod);

        trimiteMail(catre, "Codul tău de verificare — Rezervo", html);
    }

    public void trimiteNotificare(String catre, String titlu, String continut) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background-color:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a73e8 0%%,#0d47a1 100%%);padding:36px 40px;text-align:center;">
                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Platforma ta de rezervări</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px;">
                        <h2 style="margin:0 0 16px;color:#1a1a2e;font-size:20px;font-weight:600;">%s</h2>
                        <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">%s</p>
                        <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                          Poți vedea toate notificările tale accesând contul tău pe platformă.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">
                          &copy; 2025 Rezervo &mdash; Acest email a fost generat automat, te rugăm să nu răspunzi.
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(titlu, continut);

        trimiteMail(catre, titlu + " — Rezervo", html);
    }

    public void trimiteConfirmareRezervareClient(String catre, String numeClient,
            String numeProprietate, String numeCamera,
            String oras, String checkIn, String checkOut,
            int nopti, int nrPersoane, String pretTotal) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td style="background:#2563eb;padding:30px 40px;text-align:center;">
                        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Rezervă simplu. Trăiești liber.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 28px;">
                        <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">Rezervarea ta a fost confirmată!</h2>
                        <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">Bună, <strong>%s</strong>! Rezervarea ta a fost înregistrată cu succes. Îți dorim un sejur minunat!</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border-radius:8px;margin-bottom:20px;">
                          <tr><td style="padding:14px 18px;">
                            <p style="margin:0 0 10px;color:#2563eb;font-size:11px;font-weight:700;letter-spacing:.06em;">PROPRIETATE</p>
                            <p style="margin:0;font-size:16px;font-weight:700;color:#003580;">%s</p>
                            <p style="margin:4px 0 0;font-size:13px;color:#555;">%s · %s</p>
                          </td></tr>
                        </table>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border:2px dashed #2563eb;border-radius:8px;margin-bottom:20px;">
                          <tr><td style="padding:16px 20px;">
                            <p style="margin:0 0 12px;color:#2563eb;font-size:11px;font-weight:700;letter-spacing:.06em;">DETALII REZERVARE</p>
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Check-in</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Check-out</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Durata</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%d %s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Persoane</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%d %s</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top:1px solid #c7d4f5;padding:10px 0 0;"></td>
                              </tr>
                              <tr>
                                <td style="font-size:15px;font-weight:700;color:#003580;padding:2px 0;">Total</td>
                                <td style="font-size:15px;font-weight:700;color:#003580;text-align:right;">%s RON</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <p style="margin:0 0 16px;color:#555;font-size:13px;line-height:1.6;">La check-in va trebui să confirmi sosirea direct din aplicație. Proprietarul te va contacta dacă sunt detalii suplimentare.</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;">
                          <tr><td style="padding:12px 16px;color:#92400e;font-size:13px;">
                            ⚠️ Nu ai efectuat această rezervare? Contactează-ne imediat la <strong>suport@rezervo.ro</strong>
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:18px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">&copy; 2026 Rezervo &mdash; Email generat automat, te rugăm să nu răspunzi.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                numeClient,
                numeProprietate, numeCamera, oras,
                checkIn, checkOut,
                nopti, nopti == 1 ? "noapte" : "nopți",
                nrPersoane, nrPersoane == 1 ? "adult" : "adulți",
                pretTotal
            );
        trimiteMail(catre, "Rezervarea ta la " + numeProprietate + " — Rezervo", html);
    }

    public void trimiteReminderCheckInClient(String catre, String numeClient,
            String numeProprietate, String numeCamera, String oras,
            String checkIn, String checkOut) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td style="background:#0f6e56;padding:30px 40px;text-align:center;">
                        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Check-in mâine — ești pregătit?</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 28px;">
                        <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">Mâine e ziua cea mare!</h2>
                        <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">Bună, <strong>%s</strong>! Ai check-in mâine la <strong>%s</strong> — %s.</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px dashed #0f6e56;border-radius:8px;margin-bottom:20px;">
                          <tr><td style="padding:16px 20px;">
                            <p style="margin:0 0 12px;color:#0f6e56;font-size:11px;font-weight:700;letter-spacing:.06em;">REAMINTIRE CHECK-IN</p>
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Proprietate</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Camera</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Data check-in</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Data check-out</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <p style="margin:0 0 16px;color:#555;font-size:13px;line-height:1.6;">Nu uita să confirmi check-in-ul din aplicație la sosire. Dacă ai nevoie să schimbi ora, contactează proprietarul din mesageria Rezervo.</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border-left:4px solid #f59e0b;border-radius:4px;">
                          <tr><td style="padding:12px 16px;color:#92400e;font-size:13px;">
                            ⚠️ Rezervarea se anulează automat dacă check-in-ul nu este confirmat în ziua sosirii.
                          </td></tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:18px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">&copy; 2026 Rezervo &mdash; Email generat automat, te rugăm să nu răspunzi.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(numeClient, numeProprietate, oras,
                numeProprietate, numeCamera, checkIn, checkOut);
        trimiteMail(catre, "Check-in mâine la " + numeProprietate + " — Rezervo", html);
    }

    public void trimiteRezervareNouaProprietar(String catre, String numeProprietar,
            String numeClient, String emailClient, String telefonClient,
            String numeProprietate, String numeCamera,
            String checkIn, String checkOut,
            int nrPersoane, String pretTotal) {
        String html = """
            <!DOCTYPE html>
            <html lang="ro">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
            <body style="margin:0;padding:0;background:#f4f6f8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
                    <tr>
                      <td style="background:#1e40af;padding:30px 40px;text-align:center;">
                        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Rezervo</h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Ai o rezervare nouă!</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:36px 40px 28px;">
                        <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">Rezervare nouă la %s</h2>
                        <p style="margin:0 0 20px;color:#555;font-size:15px;line-height:1.6;">Bună, <strong>%s</strong>! Ai primit o rezervare nouă. Intră în contact cu clientul înainte de sosire.</p>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:8px;margin-bottom:16px;">
                          <tr><td style="padding:14px 18px;">
                            <p style="margin:0 0 10px;color:#1e40af;font-size:11px;font-weight:700;letter-spacing:.06em;">DATE CLIENT</p>
                            <p style="margin:0;font-size:16px;font-weight:700;color:#003580;">%s</p>
                            <p style="margin:4px 0 2px;font-size:13px;color:#555;">📧 %s</p>
                            <p style="margin:0;font-size:13px;color:#555;">📞 %s</p>
                          </td></tr>
                        </table>
                        <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;border:2px dashed #1e40af;border-radius:8px;margin-bottom:20px;">
                          <tr><td style="padding:16px 20px;">
                            <p style="margin:0 0 12px;color:#1e40af;font-size:11px;font-weight:700;letter-spacing:.06em;">DETALII REZERVARE</p>
                            <table width="100%%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Camera</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Check-in</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Check-out</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%s</td>
                              </tr>
                              <tr>
                                <td style="font-size:13px;color:#555;padding:4px 0;">Persoane</td>
                                <td style="font-size:13px;font-weight:700;color:#003580;text-align:right;">%d %s</td>
                              </tr>
                              <tr>
                                <td colspan="2" style="border-top:1px solid #c7d4f5;padding:10px 0 0;"></td>
                              </tr>
                              <tr>
                                <td style="font-size:15px;font-weight:700;color:#003580;padding:2px 0;">Valoare totală</td>
                                <td style="font-size:15px;font-weight:700;color:#003580;text-align:right;">%s RON</td>
                              </tr>
                            </table>
                          </td></tr>
                        </table>
                        <p style="margin:0;color:#555;font-size:13px;line-height:1.6;">Poți contacta clientul direct prin mesageria Rezervo sau prin datele de contact de mai sus.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f8fafc;padding:18px 40px;border-top:1px solid #e8ecf0;text-align:center;">
                        <p style="margin:0;color:#aaa;font-size:12px;">&copy; 2026 Rezervo &mdash; Panoul tău de proprietar</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                numeProprietate, numeProprietar,
                numeClient, emailClient, telefonClient != null && !telefonClient.isBlank() ? telefonClient : "necompletat",
                numeCamera, checkIn, checkOut,
                nrPersoane, nrPersoane == 1 ? "adult" : "adulți",
                pretTotal
            );
        trimiteMail(catre, "Rezervare nouă la " + numeProprietate + " — Rezervo", html);
    }

    private void trimiteMail(String catre, String subiect, String html) {
        try {
            MimeMessage mesaj = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mesaj, true, "UTF-8");
            helper.setTo(catre);
            helper.setSubject(subiect);
            helper.setText(html, true);
            mailSender.send(mesaj);
        } catch (MessagingException e) {
            throw new RuntimeException("Eroare la trimiterea emailului: " + e.getMessage(), e);
        }
    }
}
