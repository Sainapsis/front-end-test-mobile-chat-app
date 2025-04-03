@echo off
echo Ejecutando pruebas unitarias y de integración...
cd ..
npm test
echo.
echo Ejecutando pruebas con cobertura...
npm run test:coverage
echo.
echo Pruebas completadas!
pause 