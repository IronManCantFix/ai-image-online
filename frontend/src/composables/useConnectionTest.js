import { ref } from 'vue';
import { useProxy } from '@/composables/useProxy';
export function useConnectionTest() {
    const testing = ref(false);
    const testResult = ref(null);
    async function test(endpoint, apiKey, _model) {
        testing.value = true;
        testResult.value = null;
        try {
            const { request } = useProxy();
            const resp = await request({
                targetUrl: `${endpoint}/models`,
                method: 'GET',
                headers: { 'Authorization': `Bearer ${apiKey}` },
            });
            if (resp.ok) {
                testResult.value = { ok: true, message: '连接成功！API 配置有效。' };
            }
            else {
                testResult.value = { ok: false, message: `连接失败 (${resp.status}): ${resp.body.slice(0, 200)}` };
            }
        }
        catch (e) {
            testResult.value = { ok: false, message: `请求失败: ${e instanceof Error ? e.message : String(e)}` };
        }
        finally {
            testing.value = false;
        }
    }
    return { testing, testResult, test };
}
//# sourceMappingURL=useConnectionTest.js.map